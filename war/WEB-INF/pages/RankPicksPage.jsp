<html>
<head>
<title>Sortable List Demo</title>
</head>
<body>

<script src="scriptaculous/prototype.js" type="text/javascript"></script>
<script src="scriptaculous/scriptaculous.js" type="text/javascript"></script>

<ol id="list-bowl">
<li><a href="#" onclick="return false">Auburn at Arkansas</a></li>
<li><a href="#" onclick="return false">Florida at LSU</a></li>
<li><a href="#" onclick="return false">Oklahoma vs. Texas</a></li>
<li><a href="#" onclick="return false">Georgia at Tennessee</a></li>
</ol>

<script type="text/javascript">
    Sortable.create("list-bowl", {handles:$$('#list-bowl a')});
</script>


</body>
</html>
