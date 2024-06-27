# console-log-interceptor
Console that can intercept console.log messages and execute scripts (calls eval() )

Using:

<iframe src="./console.html" id="console"></iframe>
<script> 
    const iframeConsole = document.getElementById("console");
    console.log = (msg) => iframeConsole.contentWindow.postMessage(msg, "*");
</script>
