# PaperFlood
JavaScript that can flood local printers with or without the user's knowledge. https://xmb5.github.io/PaperFlood/

## Conecpt
Overall, PaperFlood uses [cross-site printing](https://hacking-printers.net/wiki/index.php/Cross-site_printing).  

### Raw Printing
First, you must understand how [raw printing](https://hacking-printers.net/wiki/index.php/Port_9100_printing) works. If a printer receives a TCP connection to port 9100, the printer will follow the commands send to it in a native format. If no valid commands are sent, the printer seems prints all the bytes it receives. 

### Procedure
1. use [WebRTC to get your local IP address](https://github.com/diafygi/webrtc-ips)
2. use your local IP address to guess other local IP addresses on the same network
3. run a modified version of this [LAN scanner] (https://github.com/beefproject/beef/blob/master/modules/network/identify_lan_subnets/command.js) that finds live hosts on your network.
4. send an XHR request to discovered hosts on port 9100
  - If the  request throws an error within a few milliseconds, port 9100 is probably closed, and the host is probably not a printer
  - If the request does not throw an error for a second, the port is probably open, and the host is probably a printer
5. send tons of XHR requests to any discovered printers

## Testing
One way to test this program is to use [netcat](https://en.wikipedia.org/wiki/Netcat). Head over to a terminal and type `nc -l 9123`. Make sure to change the javascript to use port 9123 instead of 9100 by clicking the testing button. Watch your terminal, and you should see some random characters printed.
