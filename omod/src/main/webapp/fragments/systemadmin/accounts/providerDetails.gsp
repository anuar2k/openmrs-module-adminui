<%
    ui.includeJavascript("adminui", "fragments/systemadmin/providerDetails.js")

    def createAccount = (account.person.personId == null ? true : false);
%>

<% if(!createAccount) { %>
<script type="text/javascript">
    //This function is in providerDetails.js
    initProviderDetails(${uuidAndProviderJson}, ${providerRolesJson});
</script>

<div id="adminui-provider-details" ng-controller="ProviderDetailsController">

<form name="providerDetailsForm" class="simple-form-ui" novalidate>
<% } %>
    <fieldset class="adminui-account-fieldset">
    <legend><b>${ ui.message("adminui.provider.details") }</b></legend>
    <% if(createAccount) { %>
        <input id="adminui-addProviderAccount" type="checkbox" name="addProviderAccount" value="true"
        <% if (otherAccountData.getAddProviderAccount()) { %> checked='checked'<% } %>
               ng-model="addProviderAccount">

        ${ ui.message("adminui.account.addProviderAccount") }
        <div ng-show="addProviderAccount">
        ${ui.includeFragment("adminui", "systemadmin/accounts/providerFormFields")}
        </div>
    <% } %>

    <% if(!createAccount) { %>
        <div id="adminui-providers">
            <ul>
                <% account.providerAccounts.each { %>
                <li ng-class="{'ui-state-disabled':inEditMode}">
                    <a href="#${ it.uuid }" <% if(!it.providerId) { %>
                       title="${ ui.message("adminui.account.addAnotherProviderAccount") }"<% } %>>
                        <% if(it.providerId) { %>
                        <span>
                            <i ng-class="{'icon-reply edit-action right':uuidProviderMap['${it.uuid}'].retired,
                                    'icon-remove delete-action right':!uuidProviderMap['${it.uuid}'].retired,
                                    'invisible':inEditMode}"
                                ng-click="uuidProviderMap['${it.uuid}'].retired ? restore('${it.uuid}') : retire('${it.uuid}')"
                                ng-attr-title="{{uuidProviderMap['${it.uuid}'].retired ? '${ui.message("general.restore")}' :
                                '${ui.message("general.retire")}'}}"></i>
                        </span>
                        <span ng-class="{retired: uuidProviderMap['${it.uuid}'].retired}">
                            {{getTabLabel('${it.uuid}', '${ui.message("adminui.account.provider.no.role")}')}}
                        </span>&nbsp;&nbsp;
                        <% } else { %>
                        <i class="icon-plus add-action right ng-class:{'invisible':inEditMode}" ng-click="add('${it.uuid}')"></i>
                        <% } %>
                    </a>
                </li>
             <% } %>
            </ul>

            <% account.providerAccounts.each { %>
            <div id="${it.uuid}">
                ${ui.includeFragment("adminui", "systemadmin/accounts/providerTabContentPane", [provider:it])}
            </div>
            <% } %>
        </div>
    <% } %>

    </fieldset>
<% if(!createAccount) { %>
</form>

<script id="retireProviderTemplate" type="text/ng-template">
    ${ui.includeFragment("adminui", "systemadmin/accounts/retireProviderDialog")}
</script>

</div>

<script type="text/javascript">
    angular.bootstrap("#adminui-provider-details", [ 'adminui.providerDetails' ]);
</script>
<% } %>