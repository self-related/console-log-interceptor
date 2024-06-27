# console-log-interceptor
Console that can intercept console.log messages and execute scripts (calls eval() )

Using:
```
<iframe src="./console.html" id="console"></iframe>
<script> 
    const iframeConsole = document.getElementById("console");
    console.log = (msg) => iframeConsole.contentWindow.postMessage(msg, "*");
</script>
```
![cli](https://github.com/self-related/console-log-interceptor/assets/105994362/7583e766-fa87-41ff-820a-af856969b43d)
