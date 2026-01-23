"""Table Alignment and Validation"""
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import re
import structlog

logger = structlog.get_logger()


@dataclass
class AlignedTable:
    """A table with aligned and validated data"""
    headers: List[str]
    rows: List[List[Any]]
    column_types: List[str]  # text, number, currency, date, percentage
    validation_errors: List[Dict[str, Any]]
    normalized: bool
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "headers": self.headers,
            "rows": self.rows,
            "column_types": self.column_types,
            "validation_errors": self.validation_errors,
            "normalized": self.normalized,
        }
    
    def to_records(self) -> List[Dict[str, Any]]:
        """Convert to list of dictionaries"""
        records = []
        for row in self.rows:
            record = {}
            for i, value in enumerate(row):
                if i < len(self.headers):
                    record[self.headers[i]] = value
                else:
                    record[f"column_{i}"] = value
            records.append(record)
        return records


class TableAligner:
    """Aligns and validates table data"""
    
    def __init__(self):
        self.currency_pattern = re.compile(r'^[\$£€¥]?\s*-?[\d,]+\.?\d*$')
        self.percentage_pattern = re.compile(r'^-?[\d\.]+\s*%$')
        self.date_patterns = [
            re.compile(r'^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$'),
            re.compile(r'^\d{4}[/-]\d{1,2}[/-]\d{1,2}$'),
            re.compile(r'^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}$', re.IGNORECASE),
        ]
    
    def align(
        self,
        table: Dict[str, Any],
        has_header: bool = True,
    ) -> AlignedTable:
        """Align and validate table data"""
        logger.info("Aligning table", num_rows=table.get("num_rows"), num_cols=table.get("num_cols"))
        
        matrix = table.get("matrix", [])
        
        if not matrix:
            return AlignedTable(
                headers=[],
                rows=[],
                column_types=[],
                validation_errors=[],
                normalized=True,
            )
        
        # Normalize column count
        matrix = self._normalize_columns(matrix)
        
        # Detect headers
        if has_header and len(matrix) > 0:
            headers = [str(cell).strip() for cell in matrix[0]]
            data_rows = matrix[1:]
        else:
            headers = [f"Column {i+1}" for i in range(len(matrix[0]))]
            data_rows = matrix
        
        # Clean header names
        headers = self._clean_headers(headers)
        
        # Detect column types
        column_types = self._detect_column_types(data_rows)
        
        # Validate and parse values
        parsed_rows, validation_errors = self._parse_and_validate(data_rows, column_types)
        
        logger.info("Table aligned", num_errors=len(validation_errors))
        
        return AlignedTable(
            headers=headers,
            rows=parsed_rows,
            column_types=column_types,
            validation_errors=validation_errors,
            normalized=True,
        )
    
    def _normalize_columns(self, matrix: List[List[Any]]) -> List[List[Any]]:
        """Ensure all rows have the same number of columns"""
        if not matrix:
            return matrix
        
        max_cols = max(len(row) for row in matrix)
        
        normalized = []
        for row in matrix:
            if len(row) < max_cols:
                row = list(row) + [""] * (max_cols - len(row))
            normalized.append(row)
        
        return normalized
    
    def _clean_headers(self, headers: List[str]) -> List[str]:
        """Clean and normalize header names"""
        cleaned = []
        seen = set()
        
        for i, header in enumerate(headers):
            # Clean the header
            clean = header.strip()
            clean = re.sub(r'\s+', ' ', clean)
            clean = re.sub(r'[^\w\s-]', '', clean)
            
            if not clean:
                clean = f"Column {i+1}"
            
            # Handle duplicates
            original = clean
            counter = 1
            while clean.lower() in seen:
                clean = f"{original}_{counter}"
                counter += 1
            
            seen.add(clean.lower())
            cleaned.append(clean)
        
        return cleaned
    
    def _detect_column_types(self, rows: List[List[Any]]) -> List[str]:
        """Detect the data type of each column"""
        if not rows:
            return []
        
        num_cols = len(rows[0])
        column_types = []
        
        for col_idx in range(num_cols):
            values = [row[col_idx] for row in rows if col_idx < len(row)]
            col_type = self._detect_type(values)
            column_types.append(col_type)
        
        return column_types
    
    def _detect_type(self, values: List[Any]) -> str:
        """Detect the predominant type of a list of values"""
        type_counts = {
            "currency": 0,
            "percentage": 0,
            "number": 0,
            "date": 0,
            "text": 0,
        }
        
        for value in values:
            str_value = str(value).strip()
            
            if not str_value:
                continue
            
            if self.currency_pattern.match(str_value):
                type_counts["currency"] += 1
            elif self.percentage_pattern.match(str_value):
                type_counts["percentage"] += 1
            elif any(p.match(str_value) for p in self.date_patterns):
                type_counts["date"] += 1
            elif self._is_number(str_value):
                type_counts["number"] += 1
            else:
                type_counts["text"] += 1
        
        # Return the most common type
        if sum(type_counts.values()) == 0:
            return "text"
        
        return max(type_counts, key=type_counts.get)
    
    def _is_number(self, value: str) -> bool:
        """Check if a string is a number"""
        try:
            clean = value.replace(',', '').replace(' ', '')
            float(clean)
            return True
        except ValueError:
            return False
    
    def _parse_and_validate(
        self,
        rows: List[List[Any]],
        column_types: List[str],
    ) -> Tuple[List[List[Any]], List[Dict[str, Any]]]:
        """Parse values according to type and validate"""
        parsed_rows = []
        errors = []
        
        for row_idx, row in enumerate(rows):
            parsed_row = []
            
            for col_idx, value in enumerate(row):
                col_type = column_types[col_idx] if col_idx < len(column_types) else "text"
                str_value = str(value).strip()
                
                try:
                    parsed_value = self._parse_value(str_value, col_type)
                    parsed_row.append(parsed_value)
                except ValueError as e:
                    errors.append({
                        "row": row_idx,
                        "col": col_idx,
                        "value": str_value,
                        "expected_type": col_type,
                        "error": str(e),
                    })
                    parsed_row.append(str_value)  # Keep original value
            
            parsed_rows.append(parsed_row)
        
        return parsed_rows, errors
    
    def _parse_value(self, value: str, expected_type: str) -> Any:
        """Parse a value according to its expected type"""
        if not value:
            return None
        
        if expected_type == "currency":
            clean = re.sub(r'[^\d.-]', '', value)
            return float(clean) if clean else 0.0
        
        elif expected_type == "percentage":
            clean = value.replace('%', '').strip()
            return float(clean) / 100 if clean else 0.0
        
        elif expected_type == "number":
            clean = value.replace(',', '').strip()
            if '.' in clean:
                return float(clean)
            return int(clean)
        
        elif expected_type == "date":
            # Return as string, can be parsed to datetime later
            return value
        
        return value


# Singleton instance
table_aligner = TableAligner()
