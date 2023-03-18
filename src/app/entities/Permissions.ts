export interface Perms {
    create: boolean;
    view: boolean;
    update: boolean;
    delete: boolean;
    multiple_accounts: boolean;
    min_accounts: string;
    max_accounts: string;
    multiple_orgs: boolean;
    min_orgs: number;
    max_orgs: number;
}

export default class Permissions {
    role: string = 'primary_admin';
    permissions: any = {};
    status: string = 'approved';
    email: string = '';

    dashboard: any = {
        access_graphs: false,
        disable_module: false
    };
    domains: any = {
        view_all: false,
        delete_account: false,
        create_zone: false,
        visit_cpanel: false,
        create_email: false,
        manage_dns: false,
        disable_module: false
    };
    web: any = {
        buy_new: false,
        delete_account: false,
        view_cpanel: false,
        view_details: false,
        list_details: false,
        disable_module: false
    };
    wordpress: any = {
        disable_module: false,
        list_details: false,
        view_details: false,
        view_cpanel: false,
        delete_account: false,
        buy_new: false
    };
    compute_engine: any = {
        disable_module: false,
        list_details: false,
        view_details: false,
        visit_cpanel: false,
        delete: false,
        add_new: false,
        upgrade: false
    };
    emails: any = {
        disable_module: false,
        list_accounts: false,
        create_account: false,
        manage_account: false,
        upgarde_storage: false,
        delete: false,
        suspend: false,
        connect_devices: false,
        upgrade_plan: false,
        access_onemail: false,
        access_webmail: false
    };
    billing: any = {
        billing_info: {
            disable_module: false,
            show_details: false,
            update_details: false,
            update_card: false,
            add_new_card: false
        },
        domains: {
            disable_module: false,
            auto_renew: false,
            deactivate: false,
            show_invoices: false,
            invoice_downloads: false,
            pay_invoices: false
        },
        web: {
            disable_module: false,
            auto_renew: false,
            deactivate: false,
            show_invoices: false,
            invoice_downloads: false,
            pay_invoices: false
        },
        wordpress: {
            disable_module: false,
            auto_renew: false,
            deactivate: false,
            show_invoices: false,
            invoice_downloads: false,
            pay_invoices: false
        },
        compute_engine: {
            disable_module: false,
            auto_renew: false,
            deactivate: false,
            show_invoices: false,
            invoice_downloads: false,
            pay_invoices: false
        },
        emails: {
            disable_module: false,
            auto_renew: false,
            deactivate: false,
            show_invoices: false,
            invoice_downloads: false,
            pay_invoices: false
        },
        dedicated_servers: {
            disable_module: false,
            auto_renew: false,
            deactivate: false,
            show_invoices: false,
            invoice_downloads: false,
            pay_invoices: false
        }
    };
    team: any = {
        disable_module: false,
        list: false,
        view: false,
        add: false,
        delete: false,
        change_status: false
    };
    support: any = {
        change_status: false,
        delete: false,
        create: false,
        view: false,
        list: false,
        disable_module: false
    };
    
    constructor(email: string) {
        this.email = email;

        this.permissions = [
            {
                module: 'dashboard',
                perms: this.dashboard
            },
            {
                module: 'domain',
                perms: this.domains
            },
            {
                module: 'web',
                perms: this.web
            },
            {
                module: 'wordpress',
                perms: this.wordpress
            },
            {
                module: 'compute_engine',
                perms: this.compute_engine
            },
            {
                module: 'email',
                perms: this.emails
            },
            {
                module: 'billing',
                perms: this.billing
            },
            {
                module: 'team',
                perms: this.team
            },
            {
                module: 'support',
                perms: this.support
            }
        ];
    }
}