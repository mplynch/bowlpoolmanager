<%@tag language="java" pageEncoding="ISO-8859-1"%>
<%@tag import="com.mierdasoft.bowlpoolmanager.view.LoginBean" %>
<%@attribute name="login" required="true" type="com.mierdasoft.bowlpoolmanager.view.LoginBean" %>
		<div id="login">
			<a href="${login.url}">${login.status}</a>
		</div>
