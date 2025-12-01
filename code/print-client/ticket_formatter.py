"""
Ticket formatting module for thermal printer
Handles ESC/POS command generation and ticket layout formatting
"""

import logging
import qrcode
from io import BytesIO
from PIL import Image
from typing import Dict, Any, Optional, List

logger = logging.getLogger('PrinterClient.TicketFormatter')


class TicketFormatter:
    """Formats tickets for ESC/POS thermal printers"""
    
    # ESC/POS command constants
    ESC = b'\x1b'
    GS = b'\x1d'
    
    def __init__(self, encoding: str = 'cp1252'):
        """
        Initialize ticket formatter
        
        Args:
            encoding: Character encoding for the printer (default: cp1252 for Windows-1252)
        """
        self.encoding = encoding
    
    def format_ticket(
        self,
        volgnummer: str,
        klant_type: str,
        afdeling_naam: str,
        voorwerp_beschrijving: Optional[str],
        klacht_beschrijving: Optional[str],
        print_data: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Format a complete ticket with ESC/POS commands
        
        Args:
            volgnummer: Tracking number
            klant_type: Customer type (Student/Externe)
            afdeling_naam: Department name
            voorwerp_beschrijving: Item description (optional)
            klacht_beschrijving: Problem description (optional)
            print_data: Additional print data (type, materials, prices, etc.)
            
        Returns:
            Raw bytes ready to send to printer
        """
        is_delivery = print_data and print_data.get('type') == 'delivery'
        
        cmd = self._init_printer()
        cmd += self._format_header(is_delivery)
        cmd += self._format_separator()
        cmd += self._format_ticket_details(volgnummer, klant_type, afdeling_naam, voorwerp_beschrijving, klacht_beschrijving)
        
        if is_delivery:
            cmd += self._format_materials_section(print_data)
        
        cmd += self._format_footer(volgnummer, is_delivery)
        cmd += self._cut_paper()
        
        return cmd
    
    def _init_printer(self) -> bytes:
        """Initialize printer and set encoding"""
        cmd = self.ESC + b'@'  # Initialize printer
        cmd += self.ESC + b't\x10'  # Set character encoding to Windows-1252
        return cmd
    
    def _format_header(self, is_delivery: bool = False) -> bytes:
        """Format ticket header"""
        cmd = self.ESC + b'a\x01'  # Center alignment
        cmd += self.ESC + b'E\x01'  # Bold on
        cmd += self.GS + b'!\x11'  # Double height
        cmd += b'REPAIR CAFE\n'
        cmd += self.GS + b'!\x00'  # Normal size
        
        if is_delivery:
            cmd += b'DELIVERY RECEIPT\n'
        else:
            cmd += b'TICKET\n'
        
        cmd += self.ESC + b'E\x00'  # Bold off
        cmd += b'\n'
        
        return cmd
    
    def _format_separator(self) -> bytes:
        """Format separator line"""
        return b'=' * 42 + b'\n\n'
    
    def _format_ticket_details(
        self,
        volgnummer: str,
        klant_type: str,
        afdeling_naam: str,
        voorwerp_beschrijving: Optional[str],
        klacht_beschrijving: Optional[str]
    ) -> bytes:
        """Format ticket details section"""
        # Use center alignment - the text will be centered on the paper
        cmd = self.ESC + b'a\x01'  # Center alignment
        
        # Format basic info lines
        lines = [
            f'{self.ESC.decode("latin1")}\x45\x01Volgnummer:{self.ESC.decode("latin1")}\x45\x00  {volgnummer}',
            f'{self.ESC.decode("latin1")}\x45\x01Klanttype:{self.ESC.decode("latin1")}\x45\x00   {klant_type}',
            f'{self.ESC.decode("latin1")}\x45\x01Afdeling:{self.ESC.decode("latin1")}\x45\x00    {afdeling_naam}'
        ]

        # Find the longest line to determine padding
        max_len = max(len(line) for line in lines)
        
        # Print each line centered as a block
        for line in lines:
            cmd += line.ljust(max_len).encode(self.encoding, errors='replace') + b'\n'
        
        cmd += b'\n'
        
        cmd += self._format_separator()

        # Add descriptions with wrapping for longer text
        # Description fields get more space (up to 42 chars per line for better readability)
        if voorwerp_beschrijving:
            cmd += self.ESC + b'a\x00'  # Left alignment
            cmd += self.ESC + b'E\x01'  # Bold on
            cmd += b'Voorwerp:\n'
            cmd += self.ESC + b'E\x00'  # Bold off
            cmd += self._wrap_text(voorwerp_beschrijving, 42)
            cmd += b'\n'
        
        if klacht_beschrijving:
            cmd += self.ESC + b'E\x01'  # Bold on
            cmd += b'Probleem:\n'
            cmd += self.ESC + b'E\x00'  # Bold off
            cmd += self._wrap_text(klacht_beschrijving, 42)
            cmd += self.ESC + b'a\x01'  # Center alignment
            cmd += b'\n'
        
        return cmd
    
    def _wrap_text(self, text: str, width: int) -> bytes:
        """Wrap text to specified width for better readability"""
        words = text.split()
        lines = []
        current_line = []
        current_length = 0
        
        for word in words:
            word_length = len(word)
            # +1 for the space
            if current_length + word_length + (1 if current_line else 0) <= width:
                current_line.append(word)
                current_length += word_length + (1 if current_length > 0 else 0)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
                current_length = word_length
        
        if current_line:
            lines.append(' '.join(current_line))
        
        result = b''
        for line in lines:
            result += line.encode(self.encoding, errors='replace') + b'\n'
        
        return result
    
    def _format_materials_section(self, print_data: Dict[str, Any]) -> bytes:
        """Format materials and pricing section for delivery receipts"""
        cmd = b'================================\n'
        cmd += self.ESC + b'E\x01'  # Bold on
        cmd += b'GEBRUIKTE MATERIALEN\n'
        cmd += self.ESC + b'E\x00'  # Bold off
        cmd += b'================================\n'
        
        materials = print_data.get('materials', [])
        if materials:
            for material in materials:
                naam = material.get('naam', 'Unknown')
                aantal = material.get('aantal', 0)
                prijs = material.get('prijs', 0)
                
                # Material name and quantity
                line = f'{naam[:25]:<25} {aantal:>2}x'.encode(self.encoding, errors='replace')
                cmd += line + b'\n'
                
                # Price on next line, right-aligned
                cmd += f'                    EUR {prijs:>6.2f}\n'.encode(self.encoding, errors='replace')
        else:
            cmd += b'Geen materialen gebruikt\n'
        
        cmd += b'\n'
        cmd += b'--------------------------------\n'
        
        # Totals
        total_price = print_data.get('totalPrice', 0)
        cmd += self.ESC + b'E\x01'  # Bold on
        cmd += f'TOTAAL:             EUR {total_price:>6.2f}\n'.encode(self.encoding, errors='replace')
        cmd += self.ESC + b'E\x00'  # Bold off
        cmd += b'\n'
        
        return cmd
    
    def _format_footer(self, volgnummer: str, is_delivery: bool = False) -> bytes:
        """Format ticket footer"""
        cmd = self._format_separator()
        cmd += self.ESC + b'a\x01'  # Center alignment
        
        if is_delivery:
            cmd += b'Bedankt!\n\n'
        else:
            # Print QR code for non-delivery tickets
            cmd += self._generate_qr_code(volgnummer)
            cmd += b'\n'
        
        return cmd
    
    def _generate_qr_code(self, data: str) -> bytes:
        """Generate QR code image commands for ESC/POS printer"""
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=6,
            border=2,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to monochrome bitmap
        img = img.convert('1')  # Convert to 1-bit pixels
        
        # Resize to appropriate width (max ~384 pixels for thermal printers)
        max_width = 384
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Convert image to ESC/POS bitmap command
        cmd = self._image_to_escpos(img)
        return cmd
    
    def _image_to_escpos(self, img: Image.Image) -> bytes:
        """Convert PIL Image to ESC/POS raster bit image command"""
        # Ensure image is in mode '1' (1-bit pixels)
        img = img.convert('1')
        
        width, height = img.size
        
        # Calculate byte width (width rounded up to nearest multiple of 8)
        byte_width = (width + 7) // 8
        
        # Start with center alignment
        cmd = self.ESC + b'a\x01'  # Center alignment
        
        # Use GS v 0 command for raster bit image
        # GS v 0 m xL xH yL yH d1...dk
        cmd += self.GS + b'v0'
        cmd += b'\x00'  # Normal mode (m = 0)
        cmd += bytes([byte_width & 0xFF, (byte_width >> 8) & 0xFF])  # xL, xH
        cmd += bytes([height & 0xFF, (height >> 8) & 0xFF])  # yL, yH
        
        # Convert image pixels to bytes
        pixels = img.load()
        for y in range(height):
            line_data = []
            for x in range(0, width, 8):
                byte_val = 0
                for bit in range(8):
                    if x + bit < width:
                        # If pixel is black (0), set bit to 1
                        if pixels[x + bit, y] == 0:
                            byte_val |= (1 << (7 - bit))
                line_data.append(byte_val)
            cmd += bytes(line_data)
        
        return cmd
    
    def _cut_paper(self) -> bytes:
        """Cut paper command"""
        return self.GS + b'V\x41\x03'
    
    def log_print_data(self, print_job_id: int, data: Dict[str, Any]) -> None:
        """
        Log print job data in a formatted way
        
        Args:
            print_job_id: ID of the print job
            data: Print job data
        """
        volgnummer = data.get('volgnummer')
        klant_type = data.get('klantType')
        afdeling_naam = data.get('afdelingNaam')
        voorwerp_beschrijving = data.get('voorwerpBeschrijving')
        klacht_beschrijving = data.get('klachtBeschrijving')
        print_data = data.get('printData')
        
        logger.info('='*60)
        logger.info(f'PRINT JOB #{print_job_id}')
        logger.info('-'*60)
        logger.info(f'Volgnummer:    {volgnummer}')
        logger.info(f'Klanttype:     {klant_type}')
        logger.info(f'Afdeling:      {afdeling_naam}')
        logger.info(f'Voorwerp:      {voorwerp_beschrijving or "N/A"}')
        logger.info(f'Probleem:      {klacht_beschrijving or "N/A"}')
        
        # Log print data if available
        if print_data:
            logger.info(f'Type:          {print_data.get("type", "standard")}')
            if print_data.get('materials'):
                logger.info(f'Materials:     {len(print_data["materials"])} items')
            if print_data.get('totalPrice') is not None:
                logger.info(f'Total:         €{print_data["totalPrice"]:.2f}')
        
        logger.info('='*60)
