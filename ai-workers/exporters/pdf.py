"""PDF Export Service"""
from typing import List, Dict, Any, Optional
from io import BytesIO
import structlog

logger = structlog.get_logger()


class PDFExporter:
    """Export structured documents to PDF"""
    
    def __init__(self):
        self._reportlab = None
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.lib import colors
            self._reportlab = {
                'letter': letter,
                'A4': A4,
                'SimpleDocTemplate': SimpleDocTemplate,
                'Paragraph': Paragraph,
                'Spacer': Spacer,
                'Table': Table,
                'TableStyle': TableStyle,
                'getSampleStyleSheet': getSampleStyleSheet,
                'ParagraphStyle': ParagraphStyle,
                'inch': inch,
                'colors': colors,
            }
            logger.info("ReportLab loaded for PDF export")
        except ImportError:
            logger.warning("ReportLab not available, PDF export disabled")
    
    def export(
        self,
        document: Dict[str, Any],
        output_path: Optional[str] = None,
        page_size: str = "A4",
        include_metadata: bool = True,
    ) -> bytes:
        """Export structured document to PDF"""
        if not self._reportlab:
            raise RuntimeError("ReportLab not installed. Install with: pip install reportlab")
        
        logger.info("Exporting document to PDF")
        
        # Create PDF buffer
        buffer = BytesIO()
        
        # Set page size
        size = self._reportlab['A4'] if page_size == "A4" else self._reportlab['letter']
        
        # Create document
        doc = self._reportlab['SimpleDocTemplate'](
            buffer,
            pagesize=size,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )
        
        # Build content
        story = []
        styles = self._reportlab['getSampleStyleSheet']()
        
        # Title
        if document.get('title'):
            title_style = styles['Title']
            story.append(self._reportlab['Paragraph'](document['title'], title_style))
            story.append(self._reportlab['Spacer'](1, 12))
        
        # Metadata
        if include_metadata and document.get('metadata'):
            meta_style = styles['Normal']
            meta = document['metadata']
            
            if meta.get('dates_found'):
                story.append(self._reportlab['Paragraph'](
                    f"<b>Date:</b> {meta['dates_found'][0]}",
                    meta_style
                ))
            
            story.append(self._reportlab['Spacer'](1, 12))
        
        # Content blocks
        for block in document.get('blocks', []):
            block_type = block.get('type', 'text')
            content = block.get('content', '')
            
            if block_type == 'title':
                story.append(self._reportlab['Paragraph'](content, styles['Heading1']))
            elif block_type == 'heading':
                story.append(self._reportlab['Paragraph'](content, styles['Heading2']))
            elif block_type == 'paragraph':
                story.append(self._reportlab['Paragraph'](content, styles['Normal']))
            elif block_type == 'list':
                if isinstance(content, list):
                    for item in content:
                        story.append(self._reportlab['Paragraph'](
                            f"• {item}",
                            styles['Normal']
                        ))
            elif block_type == 'table':
                if isinstance(content, list):
                    table = self._create_table(content)
                    if table:
                        story.append(table)
            
            story.append(self._reportlab['Spacer'](1, 6))
        
        # Tables section
        if document.get('tables'):
            story.append(self._reportlab['Paragraph']("Tables", styles['Heading2']))
            story.append(self._reportlab['Spacer'](1, 6))
            
            for i, table_data in enumerate(document['tables']):
                matrix = table_data.get('matrix', [])
                if matrix:
                    table = self._create_table(matrix)
                    if table:
                        story.append(table)
                        story.append(self._reportlab['Spacer'](1, 12))
        
        # Key-Value pairs
        if document.get('key_values'):
            story.append(self._reportlab['Paragraph']("Extracted Data", styles['Heading2']))
            story.append(self._reportlab['Spacer'](1, 6))
            
            kv_data = [[k.replace('_', ' ').title(), str(v)] 
                       for k, v in document['key_values'].items()]
            
            if kv_data:
                table = self._create_table(kv_data, header=False)
                if table:
                    story.append(table)
        
        # Build PDF
        doc.build(story)
        
        # Get bytes
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        # Optionally save to file
        if output_path:
            with open(output_path, 'wb') as f:
                f.write(pdf_bytes)
            logger.info(f"PDF saved to {output_path}")
        
        logger.info("PDF export complete", size_bytes=len(pdf_bytes))
        return pdf_bytes
    
    def _create_table(
        self,
        data: List[List[Any]],
        header: bool = True,
    ) -> Optional[Any]:
        """Create a ReportLab table"""
        if not data:
            return None
        
        Table = self._reportlab['Table']
        TableStyle = self._reportlab['TableStyle']
        colors = self._reportlab['colors']
        
        # Convert all values to strings
        table_data = [[str(cell) for cell in row] for row in data]
        
        # Create table
        table = Table(table_data)
        
        # Style
        style_commands = [
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey) if header else ('BACKGROUND', (0, 0), (-1, 0), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke) if header else ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold') if header else ('FONTNAME', (0, 0), (-1, 0), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]
        
        table.setStyle(TableStyle(style_commands))
        
        return table


# Singleton instance
pdf_exporter = PDFExporter()
