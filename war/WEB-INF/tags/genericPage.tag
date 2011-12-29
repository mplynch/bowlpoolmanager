<%@tag language="java" description="Overall Page template"
	pageEncoding="ISO-8859-1"%>
<%@taglib prefix="t" tagdir="/WEB-INF/tags"%>
<%@attribute name="menu"%>
<%@attribute name="pageTitle" type="java.lang.String"%>
<%@attribute name="copyrightNotice" 
	type="com.mierdasoft.bowlpoolmanager.view.CopyrightBean"%>

<html>
<head>
<link type="text/css" href="/style.css" rel="stylesheet" />
<link type="text/css" href="/css/smoothness/jquery-ui-1.8.16.custom.css"
	rel="stylesheet" />
<script type="text/javascript" src="/js/jquery-1.6.2.min.js"></script>
<script type="text/javascript" src="/js/jquery-ui-1.8.16.custom.min.js"></script>
<title>${pageTitle}</title>
</head>
<body>
	<div id="wrapper">
		<div id="header">
			<h1>Bowl Pool Manager</h1>
		</div>
		<div id="menu">
			<t:menu />
		</div>
		<div id="content">
			<jsp:doBody />
		</div>
		<div id="footer">
			<t:footer copyrightNotice="${copyrightNotice.Copyright}" />
		</div>
	</div>
</body>
</html>