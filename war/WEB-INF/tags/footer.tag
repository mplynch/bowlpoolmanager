<%@ tag language="java" pageEncoding="ISO-8859-1"%>
<%@tag import="com.mierdasoft.bowlpoolmanager.view.CopyrightBean"%>
<%@attribute name="copyrightNotice" required="true"
	type="com.mierdasoft.bowlpoolmanager.view.CopyrightBean"%>
		<div id="footer">
			<p>${copyrightNotice.copyright}</p>
		</div>