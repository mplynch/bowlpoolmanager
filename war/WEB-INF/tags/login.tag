<%@tag language="java" pageEncoding="ISO-8859-1"%>
<%@tag import="com.mierdasoft.bowlpoolmanager.model.beans.LoginBean"%>
<%@attribute name="login" required="true"
	type="com.mierdasoft.bowlpoolmanager.model.beans.LoginBean"%>
<div id="login">
	<a href="${login.url}">${login.status}</a>
</div>
