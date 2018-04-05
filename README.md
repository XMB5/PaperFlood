# TODO:
There is a much more effecitve method that I found out about that can print images and is much faster. I will try to implement this within the next 2 months.

# PaperFlood
JavaScript that can flood local printers with or without the user's knowledge. [Demo](https://xmb5.github.io/PaperFlood/)

## Conecpt
Overall, PaperFlood uses [cross-site printing](https://hacking-printers.net/wiki/index.php/Cross-site_printing).  

## Procedure
1. Use [WebRTC to get your local IP address](https://github.com/diafygi/webrtc-ips).
2. Use your local IP address to guess other local IP addresses on the same network.
3. Run a modified version of this [LAN scanner] (https://github.com/beefproject/beef/blob/master/modules/network/identify_lan_subnets/command.js) that finds live hosts on your network.
4. Send an XHR request to discovered hosts on port 9100.
  - If the  request throws an error within a few milliseconds, the host is probably not a printer.
  - If the request does not throw an error for a second, the host is probably a printer.
5. Send as many XHR requests as possible to any discovered printers.

## Testing
One way to test PaperFlood is to use [netcat](https://en.wikipedia.org/wiki/Netcat). Head over to a terminal and type `nc -l 9123`. Make sure to change the code to use port 9123 instead of 9100 by clicking the testing button. Watch your terminal, and you should see some random characters printed after a few seconds. Also, your local IP address should appear on the web page.

## Credits
- [Identify LAN Subnets](https://github.com/beefproject/beef/blob/master/modules/network/identify_lan_subnets/command.js) (BeEF Project/Wade Alcorn)
- [WebRTC IPs](https://github.com/diafygi/webrtc-ips) (diafygi)
