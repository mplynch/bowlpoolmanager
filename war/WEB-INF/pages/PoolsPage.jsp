<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="t" tagdir="/WEB-INF/tags"%>
<t:genericPage>
	<jsp:body>
	<ul>
		<li>Available Pools:
			<ul>
			<c:forEach items="${pools}" var="pool">
				<li><a href="/command/ViewPool?id=${pool.id}">${pool.name}</a></li>	
			</c:forEach>
			</ul>
		</li>
	</ul>

	</jsp:body>
</t:genericPage>