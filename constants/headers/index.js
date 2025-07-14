exports.users_header = [
    {
        header: "_id",
        accessorKey: "_id",
    },
    {
        header: "Name",
        accessorKey: "name",
        // filter: true,
        // options: [
        //     {
        //         "label": "alice",
        //         "value": "Alice"
        //     },
        //     {
        //         "label": "bob",
        //         "value": "bob"
        //     }]

    },
    {
        header: "Email",
        accessorKey: "email",
    },
    {
        header: "Phone",
        accessorKey: "phone"
    },
    {
        header: "Status",
        accessorKey: "disabled",
        filter: true,
        options: [
            {
                "label": "Active",
                "value": "false"
            },
            {
                "label": "Inactive",
                "value": "true"
            }]

    },
    {
        header: "Team",
        accessorKey: 'team',
        filter: true,
        options: [
            {
                "label": "Software",
                "value": "software"
            },
            {
                "label": "Finance",
                "value": "finance"
            }]
    }

];