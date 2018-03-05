# PaperFlood
javascript that can flood local printers with or without the user's knowledge

## How does it work?
First, the javascript can [use WebRTC to get your local IP address](https://github.com/diafygi/webrtc-ips). Next, the code uses your local IP address to guess other local IP addresses on the same network. After that, the program runs a modified version of this [LAN scanner](https://github.com/beefproject/beef/blob/master/modules/network/identify_lan_subnets/command.js) that finds live hosts on your network. Finally, the code sends an ajax request to alive hosts on port 9100, the [raw printing](https://hacking-printers.net/wiki/index.php/Port_9100_printing) port. If the  request throws an error within a few milliseconds, port 9100 is probably closed, and the host is probably not a printer. If the request does not throw an error for a while, the port is probably open. If a printer receives a TCP connection to port 9100, the printer will follow the commands send to it, and (at least on my printer) if no commands are sent, the printer prints all the bytes it receives, as UTF-8. This way, the javascript can send many ajax requests to the printer, and the printer will flood with pages.

## How can I test it without flooding my printer?
One way to test this program is to use [netcat](https://en.wikipedia.org/wiki/Netcat). Head over to a terminal and type `nc -l 9123`. Make sure to change the javascript to use port 9123 instead of 9100, or just click the testing button. Watch your terminal, and you should see some random characters printed.
