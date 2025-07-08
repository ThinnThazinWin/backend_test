exports.users_header = [
    {
        header: "_id",
        accessorKey: "_id",
    },
    {
        header: "Name",
        accessorKey: "name",
        filter: true,
        options: [
            {
                "label": "alice",
                "value": "Alice"
            },
            {
                "label": "bob",
                "value": "bob"
            }]

  },
    {
        header: "Email",
        accessorKey: "email",
    },

];