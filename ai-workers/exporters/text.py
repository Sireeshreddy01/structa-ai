"""Text Export Service (Plain text, Markdown, JSON)"""
from typing import Dict, Any, Optional
import json
import structlog

logger = structlog.get_logger()


class TextExporter:
    """Export structured documents to text formats"""
    
    def export_plain_text(
        self,
        document: Dict[str, Any],
        output_path: Optional[str] = None,
        include_metadata: bool = False,
    ) -> str:
        """Export document as plain text"""
        logger.info("Exporting to plain text")
        
        lines = []
        
        # Title
        if document.get('title'):
            lines.append(document['title'])
            lines.append('=' * len(document['title']))
            lines.append('')
        
        # Metadata
        if include_metadata and document.get('metadata'):
            lines.append('--- Metadata ---')
            for key, value in document['metadata'].items():
                lines.append(f"{key}: {value}")
            lines.append('')
        
        # Key-values
        if document.get('key_values'):
            for key, value in document['key_values'].items():
                lines.append(f"{key.replace('_', ' ').title()}: {value}")
            lines.append('')
        
        # Content blocks
        for block in document.get('blocks', []):
            content = block.get('content', '')
            block_type = block.get('type', 'text')
            
            if block_type == 'list' and isinstance(content, list):
                for item in content:
                    lines.append(f"  • {item}")
            elif block_type == 'table' and isinstance(content, list):
                lines.append(self._format_table_ascii(content))
            else:
                lines.append(str(content))
            
            lines.append('')
        
        # Raw text fallback
        if not document.get('blocks') and document.get('raw_text'):
            lines.append(document['raw_text'])
        
        text = '\n'.join(lines)
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(text)
            logger.info(f"Plain text saved to {output_path}")
        
        return text
    
    def export_markdown(
        self,
        document: Dict[str, Any],
        output_path: Optional[str] = None,
    ) -> str:
        """Export document as Markdown"""
        logger.info("Exporting to Markdown")
        
        lines = []
        
        # Title
        if document.get('title'):
            lines.append(f"# {document['title']}")
            lines.append('')
        
        # Key-values as table
        if document.get('key_values'):
            lines.append('## Extracted Data')
            lines.append('')
            lines.append('| Field | Value |')
            lines.append('|-------|-------|')
            
            for key, value in document['key_values'].items():
                lines.append(f"| {key.replace('_', ' ').title()} | {value} |")
            
            lines.append('')
        
        # Content blocks
        for block in document.get('blocks', []):
            content = block.get('content', '')
            block_type = block.get('type', 'text')
            
            if block_type == 'title':
                lines.append(f"# {content}")
            elif block_type == 'heading':
                lines.append(f"## {content}")
            elif block_type == 'list' and isinstance(content, list):
                for item in content:
                    lines.append(f"- {item}")
            elif block_type == 'table' and isinstance(content, list):
                lines.append(self._format_table_markdown(content))
            else:
                lines.append(str(content))
            
            lines.append('')
        
        # Tables section
        if document.get('tables'):
            lines.append('## Tables')
            lines.append('')
            
            for i, table in enumerate(document['tables']):
                lines.append(f"### Table {i + 1}")
                lines.append('')
                
                matrix = table.get('matrix', [])
                if matrix:
                    lines.append(self._format_table_markdown(matrix))
                
                lines.append('')
        
        markdown = '\n'.join(lines)
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown)
            logger.info(f"Markdown saved to {output_path}")
        
        return markdown
    
    def export_json(
        self,
        document: Dict[str, Any],
        output_path: Optional[str] = None,
        indent: int = 2,
    ) -> str:
        """Export document as JSON"""
        logger.info("Exporting to JSON")
        
        json_str = json.dumps(document, indent=indent, ensure_ascii=False)
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(json_str)
            logger.info(f"JSON saved to {output_path}")
        
        return json_str
    
    def _format_table_ascii(self, matrix: list) -> str:
        """Format a table as ASCII art"""
        if not matrix:
            return ""
        
        # Calculate column widths
        col_widths = []
        for col_idx in range(len(matrix[0])):
            max_width = max(
                len(str(row[col_idx])) if col_idx < len(row) else 0
                for row in matrix
            )
            col_widths.append(max(max_width, 3))
        
        lines = []
        
        # Header separator
        separator = '+' + '+'.join('-' * (w + 2) for w in col_widths) + '+'
        
        for row_idx, row in enumerate(matrix):
            # Row content
            cells = []
            for col_idx, width in enumerate(col_widths):
                value = str(row[col_idx]) if col_idx < len(row) else ""
                cells.append(f" {value:{width}} ")
            
            lines.append('|' + '|'.join(cells) + '|')
            
            # Separator after header
            if row_idx == 0:
                lines.append(separator)
        
        # Add top and bottom separators
        lines.insert(0, separator)
        lines.append(separator)
        
        return '\n'.join(lines)
    
    def _format_table_markdown(self, matrix: list) -> str:
        """Format a table as Markdown"""
        if not matrix:
            return ""
        
        lines = []
        
        # Header
        header = '| ' + ' | '.join(str(cell) for cell in matrix[0]) + ' |'
        lines.append(header)
        
        # Separator
        separator = '|' + '|'.join('---' for _ in matrix[0]) + '|'
        lines.append(separator)
        
        # Data rows
        for row in matrix[1:]:
            line = '| ' + ' | '.join(str(cell) for cell in row) + ' |'
            lines.append(line)
        
        return '\n'.join(lines)


# Singleton instance
text_exporter = TextExporter()
