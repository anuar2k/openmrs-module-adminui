<%
    ui.decorateWith("appui", "standardEmrPage")
    ui.includeCss("adminui", "systemadmin/accounts.css")
%>

<script type="text/javascript">
    var breadcrumbs = [
        { icon: "icon-home", link: '/' + OPENMRS_CONTEXT_PATH + '/index.htm' },
        { label: "${ ui.message('coreapps.app.systemAdministration.label')}" , link: '${ui.pageLink("coreapps", "systemadministration/systemAdministration")}'},
        { label: "${ ui.message("adminui.manageAccounts.label")}", link: '${ui.pageLink("adminui", "systemadmin/accounts/manageAccounts")}' }
    ];
</script>

<a class="button" href="${ ui.pageLink("adminui", "systemadmin/accounts/account") }">
    ${ ui.message("adminui.addAccount.label") }
</a>

<hr>
<table id="list-accounts" cellspacing="0" cellpadding="2">
    <thead>
    <tr>
        <th class="adminui-expand-column ">${ ui.message("general.name")}</th>
        <th class="adminui-shrink-column">${ ui.message("adminui.gender") }</th>
        <th class="adminui-shrink-column">${ ui.message("adminui.accounts.numberOfUserAccounts") }</th>
        <th class="adminui-shrink-column">${ ui.message("adminui.accounts.numberOfProviderAccounts") }</th>
        <th class="adminui-shrink-column">${ ui.message("general.action") }</th>
    </tr>
    </thead>
    <tbody>
    <% accounts.each{  %>
    <tr>
        <td>
            <% //In case of providers not linked to person records
            def name = ""
            def isLinkedToPerson = false
            if((it.person != null && it.person.personId != null)){
                isLinkedToPerson = true
                name = ui.format(it.person)
            }
            if(name == null || name.trim() == ""){
                name = providerNameMap[it.providerAccounts[0]]
            }
            if(name == null || name.trim() == ""){
                name = it.providerAccounts[0].identifier
            }
            if(name == null || name.trim() == ""){
                name = "<i>"+ui.message("adminui.noname")+"</i>"
            }
            %>

           ${name} ${!isLinkedToPerson ? "*" : ""}
        </td>
        <td class="adminui-center">${ ui.format(it.person.gender) }</td>
        <td class="adminui-center">${ ui.format(it.userAccounts.size) }</td>
        <td class="adminui-center">${ ui.format(it.providerAccounts.size) }</td>
        <td class="adminui-center">
            <% if(isLinkedToPerson) { %>
            <i class="icon-pencil edit-action" title="${ ui.message("general.edit") }"
               onclick="location.href='${ui.pageLink("adminui", "systemadmin/accounts/account",[personId: it.person.id])}'"></i>
            <% } %>
        </td>
    </tr>
    <% } %>
    </tbody>
</table>
<br />
<i>* ${ui.message("adminui.account.provider.notLinkedToPerson")}</i>

<% if ( (accounts != null) && (accounts.size() > 0) ) { %>
${ ui.includeFragment("uicommons", "widget/dataTable", [ object: "#list-accounts",
        options: [
                bFilter: true,
                bJQueryUI: true,
                bLengthChange: false,
                iDisplayLength: 15,
                sPaginationType: '\"full_numbers\"',
                bSort: false,
                sDom: '\'ft<\"fg-toolbar ui-toolbar ui-corner-bl ui-corner-br ui-helper-clearfix datatables-info-and-pg \"ip>\''
        ]
]) }
<% } %>
