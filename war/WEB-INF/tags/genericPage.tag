<%@tag language="java" description="Overall Page template"
	pageEncoding="ISO-8859-1"%>
<%@taglib prefix="t" tagdir="/WEB-INF/tags"%>
<%@attribute name="menu"%>
<%@attribute name="pageTitle"%>
<%@attribute name="copyrightNotice" 
	type="com.mierdasoft.bowlpoolmanager.model.beans.CopyrightBean"%>
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
		<t:header />
		<t:menu />
		<div id="content">
			<t:login login="${login}"></t:login>
			<jsp:doBody />
		</div>
		<t:footer copyrightNotice="${copyrightNotice}" />
	</div>
</body>
</html>