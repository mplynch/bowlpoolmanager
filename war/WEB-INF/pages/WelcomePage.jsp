<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>

<%@ include file="jspf/header.jspf" %>
<%@ include file="jspf/menu.jspf" %>

<jsp:useBean id="login" class="com.mierdasoft.bowlpoolmanager.view.LoginBean" scope="page"/>

<div id="content">

	<div id="login">
		<a href="<jsp:getProperty name="login" property="url"/>"><jsp:getProperty name="login" property="status"/></a>
	</div>

</div>

<%@ include file="jspf/footer.jspf" %>