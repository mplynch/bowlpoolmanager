<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>

<%@ include file="WEB-INF/jspf/header.jspf" %>

<%
    UserService userService = UserServiceFactory.getUserService();
    User user = userService.getCurrentUser();
%>

<%@ include file="WEB-INF/jspf/menu.jspf" %>

<div id="content">

<%
     if (!userService.isUserLoggedIn())
     {
%>
     Please <a href="<%= userService.createLoginURL(request.getRequestURI()) %>">log in</a>>
<%
	}
	
	else
	{
%>
     Welcome, <%= userService.getCurrentUser().getNickname() %>!
     (<a href="<%=userService.createLogoutURL(request.getRequestURI()) %>">log out</a>)
<%
     }
%>

	<h3>Pools</h3>

</div>

<%@ include file="WEB-INF/jspf/footer.jspf" %>