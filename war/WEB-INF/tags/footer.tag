<%@ tag language="java" pageEncoding="ISO-8859-1"%>
<%@tag import="com.mierdasoft.bowlpoolmanager.model.beans.CopyrightBean"%>
<%@attribute name="copyrightNotice" required="true"
	type="com.mierdasoft.bowlpoolmanager.model.beans.CopyrightBean"%>
		<div id="footer">
			<p>${copyrightNotice.copyright}</p>
		</div>