<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%@ include file="jspf/header.jspf" %>
<%@ include file="jspf/menu.jspf" %>

<jsp:useBean id="error" class="com.mierdasoft.bowlpoolmanager.view.ErrorBean" scope="page"/>

<div id="content">

	<div id="error">
		<h3><jsp:getProperty name="error" property="message"/></h3>
	</div>

</div>

<%@ include file="jspf/footer.jspf" %>