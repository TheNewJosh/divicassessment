
import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    createdAt: String!
    biometricKey: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    biometricLogin(biometricKey: String!): AuthPayload
    setBiometricKey(biometricKey: String!): User
  }
`;
