Upload file `firebase-messaging-sw.js` into the domain root directory.

Get `{pubid}`, `{siteid}`, `{niche}` in your acc.

Copy and paste this code to website pages.
Make sure it is inside the `<head>` element:
```
<script src="https://richinfo.co/js/rp.js"></script>
<script>
(function() {
    RichPartners.init({
        "pubid": "{pubid}",
        "siteid": "{siteid}",
        "niche": "{niche}"
    });
})();
</script>
```
