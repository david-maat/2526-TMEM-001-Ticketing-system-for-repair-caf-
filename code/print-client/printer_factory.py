"""
Printer factory for creating printer instances
Simplifies printer instantiation based on connection type
"""

import logging
from typing import Optional

from printer_base import BasePrinter
from printer import NetworkPrinter
from usb_printer import USBPrinter

logger = logging.getLogger('PrinterClient.PrinterFactory')


def create_printer(
    connection_type: str = 'network',
    printer_ip: Optional[str] = None,
    printer_port: int = 9100,
    printer_name: Optional[str] = None,
    usb_vendor_id: int = 0x0519,
    usb_product_id: int = 0x0003,
    usb_interface: int = 0,
    usb_in_ep: int = 0x81,
    usb_out_ep: int = 0x03
) -> BasePrinter:
    """
    Factory function to create a printer instance based on connection type
    
    Args:
        connection_type: Type of printer connection ('network' or 'usb')
        printer_ip: IP address for network printer (required if connection_type='network')
        printer_port: Port for network printer (default: 9100)
        printer_name: Windows printer name for USB printer (recommended on Windows, e.g., "POS-80C")
        usb_vendor_id: USB vendor ID for USB printer (default: 0x0519 for POS-80C)
        usb_product_id: USB product ID for USB printer (default: 0x0003 for POS-80C)
        usb_interface: USB interface number (default: 0)
        usb_in_ep: USB input endpoint (default: 0x81)
        usb_out_ep: USB output endpoint (default: 0x03)
    
    Returns:
        BasePrinter instance
    
    Raises:
        ValueError: If connection_type is invalid or required parameters are missing
    
    Examples:
        # Network printer
        printer = create_printer(connection_type='network', printer_ip='192.168.1.100')
        
        # USB printer on Windows (using printer name - recommended)
        printer = create_printer(connection_type='usb', printer_name='POS-80C')
        
        # USB printer with VID/PID
        printer = create_printer(connection_type='usb', usb_vendor_id=0x0519, usb_product_id=0x0003)
    """
    connection_type = connection_type.lower()
    
    if connection_type == 'network':
        if not printer_ip:
            raise ValueError("printer_ip is required for network connection type")
        logger.info(f'Creating network printer: {printer_ip}:{printer_port}')
        return NetworkPrinter(printer_ip=printer_ip, printer_port=printer_port)
    
    elif connection_type == 'usb':
        if printer_name:
            logger.info(f'Creating USB printer with Windows name: {printer_name}')
        else:
            logger.info(f'Creating USB printer: VID={hex(usb_vendor_id)} PID={hex(usb_product_id)}')
        return USBPrinter(
            printer_name=printer_name,
            vendor_id=usb_vendor_id,
            product_id=usb_product_id,
            interface=usb_interface,
            in_ep=usb_in_ep,
            out_ep=usb_out_ep
        )
    
    else:
        raise ValueError(f"Invalid connection_type: {connection_type}. Must be 'network' or 'usb'")
