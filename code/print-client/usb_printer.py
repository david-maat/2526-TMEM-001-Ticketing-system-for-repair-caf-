"""
USB printer implementation for POS-80C thermal printer
Handles low-level printer communication via USB using python-escpos or Win32 printing
"""

import logging
import sys
from typing import Optional, Tuple

from printer_base import BasePrinter, PrinterCommunicationError

# Try to import USB printer support
try:
    from escpos.printer import Usb
    USB_AVAILABLE = True
except ImportError:
    Usb = None
    USB_AVAILABLE = False

# Try to import pyusb for device discovery
try:
    import usb.core
    import usb.util
    PYUSB_AVAILABLE = True
except ImportError:
    PYUSB_AVAILABLE = False

# Try to import Windows printer support
try:
    import win32print
    WIN32_AVAILABLE = True
except ImportError:
    win32print = None
    WIN32_AVAILABLE = False

logger = logging.getLogger('PrinterClient.USBPrinter')


def auto_detect_usb_printer() -> Optional[Tuple[int, int, int, int, int]]:
    """
    Auto-detect USB printer by scanning for printer class devices
    
    Returns:
        Tuple of (vendor_id, product_id, interface, in_ep, out_ep) or None if not found
    """
    if not PYUSB_AVAILABLE:
        logger.warning('pyusb not available - cannot auto-detect USB printers')
        return None
    
    logger.info('Scanning for USB printers...')
    
    # Find all USB devices
    devices = usb.core.find(find_all=True)
    
    for device in devices:
        try:
            # Look for printer class devices (bInterfaceClass = 7)
            for cfg in device:
                for intf in cfg:
                    if intf.bInterfaceClass == 7:  # Printer class
                        logger.info(f'Found printer: VID:PID {hex(device.idVendor)}:{hex(device.idProduct)} - {usb.util.get_string(device, device.iProduct) if device.iProduct else "Unknown"}')
                        
                        # Find endpoints
                        in_ep = None
                        out_ep = None
                        for ep in intf:
                            if usb.util.endpoint_direction(ep.bEndpointAddress) == usb.util.ENDPOINT_IN:
                                in_ep = ep.bEndpointAddress
                            elif usb.util.endpoint_direction(ep.bEndpointAddress) == usb.util.ENDPOINT_OUT:
                                out_ep = ep.bEndpointAddress
                        
                        if in_ep and out_ep:
                            logger.info(f'  Interface: {intf.bInterfaceNumber}, IN: {hex(in_ep)}, OUT: {hex(out_ep)}')
                            return (device.idVendor, device.idProduct, intf.bInterfaceNumber, in_ep, out_ep)
        except Exception as e:
            logger.debug(f'Error inspecting device {device}: {e}')
            continue
    
    logger.warning('No USB printer found')
    return None


class USBPrinter(BasePrinter):
    """USB-based thermal printer implementation for POS-80C"""
    
    def __init__(self, printer_name: Optional[str] = None,
                 vendor_id: int = 0x0519, product_id: int = 0x0003, 
                 interface: int = 0, in_ep: int = 0x81, out_ep: int = 0x03):
        """
        Initialize USB printer connection parameters
        
        Args:
            printer_name: Windows printer name (preferred on Windows, e.g., "POS-80C")
            vendor_id: USB vendor ID (0 for auto-detect)
            product_id: USB product ID (0 for auto-detect)
            interface: USB interface number (default: 0)
            in_ep: USB input endpoint (default: 0x81)
            out_ep: USB output endpoint (default: 0x03)
        """
        self.printer_name = printer_name
        self.vendor_id = vendor_id
        self.product_id = product_id
        self.interface = interface
        self.in_ep = in_ep
        self.out_ep = out_ep
        self._printer = None
        self.use_win32 = False
        
        # On Windows, prefer win32print if printer name is provided
        if sys.platform == 'win32' and printer_name and WIN32_AVAILABLE:
            self.use_win32 = True
            logger.info(f'Using Windows printer: {printer_name}')
        elif USB_AVAILABLE:
            # Auto-detect if vendor_id is 0
            if vendor_id == 0:
                logger.info('Auto-detecting USB printer...')
                detected = auto_detect_usb_printer()
                if detected:
                    self.vendor_id, self.product_id, self.interface, self.in_ep, self.out_ep = detected
                    logger.info(f'Auto-detected USB printer: VID:PID {hex(self.vendor_id)}:{hex(self.product_id)}')
                else:
                    error_msg = 'No USB printer found. Please connect a printer or specify VID/PID manually.'
                    logger.error(error_msg)
                    raise PrinterCommunicationError(error_msg)
            
            logger.info(f'Using USB printer with VID:PID {hex(self.vendor_id)}:{hex(self.product_id)}')
        else:
            error_msg = (
                "No USB backend available. On Windows, either:\n"
                "1. Set PRINTER_NAME in .env to your Windows printer name (recommended), or\n"
                "2. Install win32print: pip install pywin32, or\n"
                "3. Install libusb: https://github.com/libusb/libusb/releases"
            )
            logger.error(error_msg)
            raise PrinterCommunicationError(error_msg)
    
    def get_connection_info(self) -> str:
        """Get USB connection information"""
        if self.use_win32:
            return f"Windows Printer: {self.printer_name}"
        return f"USB: VID={hex(self.vendor_id)} PID={hex(self.product_id)}"
    
    def _get_printer(self):
        """Get or create printer instance"""
        if self._printer is None:
            try:
                if self.use_win32:
                    # Open Windows printer
                    self._printer = win32print.OpenPrinter(self.printer_name)
                    logger.debug(f'Windows printer opened: {self.printer_name}')
                else:
                    self._printer = Usb(
                        idVendor=self.vendor_id,
                        idProduct=self.product_id,
                        interface=self.interface,
                        in_ep=self.in_ep,
                        out_ep=self.out_ep
                    )
                    logger.debug('USB printer instance created')
            except Exception as e:
                error_msg = f'Failed to initialize printer: {e}'
                logger.error(error_msg)
                raise PrinterCommunicationError(error_msg)
        return self._printer
    
    def send_raw_data(self, data: bytes) -> None:
        """
        Send raw data to the printer via USB
        
        Args:
            data: Raw bytes to send to printer
            
        Raises:
            PrinterCommunicationError: If connection or sending fails
        """
        try:
            printer = self._get_printer()
            logger.info(f'Sending {len(data)} bytes to printer')
            
            if self.use_win32:
                # Use Windows printer spooler
                job_id = win32print.StartDocPrinter(printer, 1, ("Repair Cafe Ticket", None, "RAW"))
                try:
                    win32print.StartPagePrinter(printer)
                    win32print.WritePrinter(printer, data)
                    win32print.EndPagePrinter(printer)
                finally:
                    win32print.EndDocPrinter(printer)
                logger.info(f'Print data sent successfully (Job ID: {job_id})')
            else:
                printer._raw(data)
                logger.info('Print data sent successfully')
            
        except Exception as e:
            error_msg = f'Failed to print: {e}'
            logger.error(error_msg)
            # Reset printer instance on error
            self._close_printer()
            raise PrinterCommunicationError(error_msg)
    
    def test_connection(self) -> bool:
        """
        Test connection to the printer
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            if self.use_win32:
                # Test by opening and closing the printer
                test_printer = win32print.OpenPrinter(self.printer_name)
                win32print.ClosePrinter(test_printer)
            else:
                # Test USB connection
                printer = self._get_printer()
            logger.info('Printer connection test successful')
            return True
        except Exception as e:
            logger.warning(f'Printer connection test failed: {e}')
            self._close_printer()
            return False
    
    def _close_printer(self) -> None:
        """Internal method to close the printer"""
        if self._printer is not None:
            try:
                if self.use_win32:
                    win32print.ClosePrinter(self._printer)
                else:
                    self._printer.close()
                logger.debug('Printer connection closed')
            except Exception as e:
                logger.warning(f'Error closing printer: {e}')
            finally:
                self._printer = None
    
    def close(self) -> None:
        """Close the USB connection"""
        self._close_printer()
