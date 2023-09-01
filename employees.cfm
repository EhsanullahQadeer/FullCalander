<cfset codeEvents = [{ "id": 2083851, "name": "Michael"}, { "id": 2083852, "name": "James" }]>


<cffunction name="displayEvents" returnType="any" output="true">
    <cfargument name="events" type="any" required="true">
    
    <cfset _json = serializeJSON(events)>
    
    <cfreturn _json>
</cffunction>

<cfset x = displayEvents(codeEvents)>
<cfoutput>#x#</cfoutput>