<%@tag language="java" description="Menu template"
	pageEncoding="ISO-8859-1"%>
<%@taglib prefix="t" tagdir="/WEB-INF/tags"%>	
<%@tag import="com.mierdasoft.bowlpoolmanager.model.beans.MenuBean"%>
<%@tag import="com.mierdasoft.bowlpoolmanager.model.beans.MenuItemBean"%>
<%@attribute name="menu"
	type="com.mierdasoft.bowlpoolmanager.model.beans.MenuBean"%>
	<div id="menu">
		<t:login login="${login}"></t:login>
	</div>