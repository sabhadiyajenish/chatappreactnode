const GraphqlQuery = `
type User {
    _id: ID!,
    email:String,
    password:String,
    userName:String
}

 type ConverSation {
    _id: ID!,
    members:[User]!,

}

 type Message {
    _id: ID!,
    conversationId:ConverSation,
    seen:Boolean,
    senderId:[User]!
}

type Query {
    getAllUsers:[User]
    getAllMessage:[Message]
    getUserById(id:ID!):User
}
`;

export default GraphqlQuery;
