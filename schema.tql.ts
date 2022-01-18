import {
  NamedType,
  Argument,
  Field,
  InlineFragment,
  Operation,
  Selection,
  SelectionSet,
  Variable,
  Executor,
  Client,
  TypeConditionError,
  ExecutionError,
} from "@timkendall/tql";

export const VERSION = "unversioned";

export const SCHEMA_SHA = "474eda4";

const _ENUM_VALUES = {
  SCALAR: true,
  OBJECT: true,
  INTERFACE: true,
  UNION: true,
  ENUM: true,
  INPUT_OBJECT: true,
  LIST: true,
  NON_NULL: true,
  QUERY: true,
  MUTATION: true,
  SUBSCRIPTION: true,
  FIELD: true,
  FRAGMENT_DEFINITION: true,
  FRAGMENT_SPREAD: true,
  INLINE_FRAGMENT: true,
  VARIABLE_DEFINITION: true,
  SCHEMA: true,
  FIELD_DEFINITION: true,
  ARGUMENT_DEFINITION: true,
  ENUM_VALUE: true,
  INPUT_FIELD_DEFINITION: true,
} as const;

export interface CreateUserInput {
  readonly username: string;
  readonly email?: string;
  readonly avatar?: string;
  readonly postsIds?: string[];
}

export interface UpdateUserInput {
  readonly email?: string;
  readonly avatar?: string;
  readonly postsIds?: string[];
}

export interface CreatePostInput {
  readonly slug: string;
  readonly title?: string;
  readonly body?: string;
  readonly authorId?: string;
}

export interface UpdatePostInput {
  readonly title?: string;
  readonly body?: string;
  readonly authorId?: string;
}

export interface IUser {
  readonly __typename: "User";
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly username: string;
  readonly email: string | null;
  readonly avatar: string | null;
  readonly posts: ReadonlyArray<IPost> | null;
}

interface UserSelector {
  readonly __typename: () => Field<"__typename">;

  readonly id: () => Field<"id">;

  readonly createdAt: () => Field<"createdAt">;

  readonly updatedAt: () => Field<"updatedAt">;

  readonly username: () => Field<"username">;

  readonly email: () => Field<"email">;

  readonly avatar: () => Field<"avatar">;

  readonly posts: <T extends Array<Selection>>(
    select: (t: PostSelector) => T
  ) => Field<"posts", never, SelectionSet<T>>;
}

export const User: UserSelector = {
  __typename: () => new Field("__typename"),

  id: () => new Field("id"),
  createdAt: () => new Field("createdAt"),
  updatedAt: () => new Field("updatedAt"),
  username: () => new Field("username"),
  email: () => new Field("email"),
  avatar: () => new Field("avatar"),

  posts: (select) =>
    new Field("posts", undefined as never, new SelectionSet(select(Post))),
};

export interface IPost {
  readonly __typename: "Post";
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly slug: string;
  readonly title: string | null;
  readonly body: string | null;
  readonly author: IUser | null;
}

interface PostSelector {
  readonly __typename: () => Field<"__typename">;

  readonly id: () => Field<"id">;

  readonly createdAt: () => Field<"createdAt">;

  readonly updatedAt: () => Field<"updatedAt">;

  readonly slug: () => Field<"slug">;

  readonly title: () => Field<"title">;

  readonly body: () => Field<"body">;

  readonly author: <T extends Array<Selection>>(
    select: (t: UserSelector) => T
  ) => Field<"author", never, SelectionSet<T>>;
}

export const Post: PostSelector = {
  __typename: () => new Field("__typename"),

  id: () => new Field("id"),
  createdAt: () => new Field("createdAt"),
  updatedAt: () => new Field("updatedAt"),
  slug: () => new Field("slug"),
  title: () => new Field("title"),
  body: () => new Field("body"),

  author: (select) =>
    new Field("author", undefined as never, new SelectionSet(select(User))),
};

export interface IQuery {
  readonly __typename: "Query";
  readonly getUserById: IUser | null;
  readonly getUserByUsername: IUser | null;
  readonly getPostById: IPost | null;
  readonly getPostBySlug: IPost | null;
}

interface QuerySelector {
  readonly __typename: () => Field<"__typename">;

  readonly getUserById: <T extends Array<Selection>>(
    variables: { id?: Variable<"id"> | string },
    select: (t: UserSelector) => T
  ) => Field<
    "getUserById",
    [Argument<"id", Variable<"id"> | string>],
    SelectionSet<T>
  >;

  readonly getUserByUsername: <T extends Array<Selection>>(
    variables: { username?: Variable<"username"> | string },
    select: (t: UserSelector) => T
  ) => Field<
    "getUserByUsername",
    [Argument<"username", Variable<"username"> | string>],
    SelectionSet<T>
  >;

  readonly getPostById: <T extends Array<Selection>>(
    variables: { id?: Variable<"id"> | string },
    select: (t: PostSelector) => T
  ) => Field<
    "getPostById",
    [Argument<"id", Variable<"id"> | string>],
    SelectionSet<T>
  >;

  readonly getPostBySlug: <T extends Array<Selection>>(
    variables: { slug?: Variable<"slug"> | string },
    select: (t: PostSelector) => T
  ) => Field<
    "getPostBySlug",
    [Argument<"slug", Variable<"slug"> | string>],
    SelectionSet<T>
  >;
}

export const Query: QuerySelector = {
  __typename: () => new Field("__typename"),

  getUserById: (variables, select) =>
    new Field(
      "getUserById",
      [new Argument("id", variables.id, _ENUM_VALUES)],
      new SelectionSet(select(User))
    ),

  getUserByUsername: (variables, select) =>
    new Field(
      "getUserByUsername",
      [new Argument("username", variables.username, _ENUM_VALUES)],
      new SelectionSet(select(User))
    ),

  getPostById: (variables, select) =>
    new Field(
      "getPostById",
      [new Argument("id", variables.id, _ENUM_VALUES)],
      new SelectionSet(select(Post))
    ),

  getPostBySlug: (variables, select) =>
    new Field(
      "getPostBySlug",
      [new Argument("slug", variables.slug, _ENUM_VALUES)],
      new SelectionSet(select(Post))
    ),
};

export interface IMutation {
  readonly __typename: "Mutation";
  readonly createUser: IUser | null;
  readonly updateUserById: IUser | null;
  readonly updateUserByUsername: IUser | null;
  readonly createPost: IPost | null;
  readonly updatePostById: IPost | null;
  readonly updatePostBySlug: IPost | null;
}

interface MutationSelector {
  readonly __typename: () => Field<"__typename">;

  readonly createUser: <T extends Array<Selection>>(
    variables: { input?: Variable<"input"> | CreateUserInput },
    select: (t: UserSelector) => T
  ) => Field<
    "createUser",
    [Argument<"input", Variable<"input"> | CreateUserInput>],
    SelectionSet<T>
  >;

  readonly updateUserById: <T extends Array<Selection>>(
    variables: {
      id?: Variable<"id"> | string;
      input?: Variable<"input"> | UpdateUserInput;
    },
    select: (t: UserSelector) => T
  ) => Field<
    "updateUserById",
    [
      Argument<"id", Variable<"id"> | string>,
      Argument<"input", Variable<"input"> | UpdateUserInput>
    ],
    SelectionSet<T>
  >;

  readonly updateUserByUsername: <T extends Array<Selection>>(
    variables: {
      username?: Variable<"username"> | string;
      input?: Variable<"input"> | UpdateUserInput;
    },
    select: (t: UserSelector) => T
  ) => Field<
    "updateUserByUsername",
    [
      Argument<"username", Variable<"username"> | string>,
      Argument<"input", Variable<"input"> | UpdateUserInput>
    ],
    SelectionSet<T>
  >;

  readonly createPost: <T extends Array<Selection>>(
    variables: { input?: Variable<"input"> | CreatePostInput },
    select: (t: PostSelector) => T
  ) => Field<
    "createPost",
    [Argument<"input", Variable<"input"> | CreatePostInput>],
    SelectionSet<T>
  >;

  readonly updatePostById: <T extends Array<Selection>>(
    variables: {
      id?: Variable<"id"> | string;
      input?: Variable<"input"> | UpdatePostInput;
    },
    select: (t: PostSelector) => T
  ) => Field<
    "updatePostById",
    [
      Argument<"id", Variable<"id"> | string>,
      Argument<"input", Variable<"input"> | UpdatePostInput>
    ],
    SelectionSet<T>
  >;

  readonly updatePostBySlug: <T extends Array<Selection>>(
    variables: {
      slug?: Variable<"slug"> | string;
      input?: Variable<"input"> | UpdatePostInput;
    },
    select: (t: PostSelector) => T
  ) => Field<
    "updatePostBySlug",
    [
      Argument<"slug", Variable<"slug"> | string>,
      Argument<"input", Variable<"input"> | UpdatePostInput>
    ],
    SelectionSet<T>
  >;
}

export const Mutation: MutationSelector = {
  __typename: () => new Field("__typename"),

  createUser: (variables, select) =>
    new Field(
      "createUser",
      [new Argument("input", variables.input, _ENUM_VALUES)],
      new SelectionSet(select(User))
    ),

  updateUserById: (variables, select) =>
    new Field(
      "updateUserById",
      [
        new Argument("id", variables.id, _ENUM_VALUES),
        new Argument("input", variables.input, _ENUM_VALUES),
      ],
      new SelectionSet(select(User))
    ),

  updateUserByUsername: (variables, select) =>
    new Field(
      "updateUserByUsername",
      [
        new Argument("username", variables.username, _ENUM_VALUES),
        new Argument("input", variables.input, _ENUM_VALUES),
      ],
      new SelectionSet(select(User))
    ),

  createPost: (variables, select) =>
    new Field(
      "createPost",
      [new Argument("input", variables.input, _ENUM_VALUES)],
      new SelectionSet(select(Post))
    ),

  updatePostById: (variables, select) =>
    new Field(
      "updatePostById",
      [
        new Argument("id", variables.id, _ENUM_VALUES),
        new Argument("input", variables.input, _ENUM_VALUES),
      ],
      new SelectionSet(select(Post))
    ),

  updatePostBySlug: (variables, select) =>
    new Field(
      "updatePostBySlug",
      [
        new Argument("slug", variables.slug, _ENUM_VALUES),
        new Argument("input", variables.input, _ENUM_VALUES),
      ],
      new SelectionSet(select(Post))
    ),
};

export const query = <T extends Array<Selection>>(
  name: string,
  select: (t: typeof Query) => T
): Operation<SelectionSet<T>> =>
  new Operation(name, "query", new SelectionSet(select(Query)));

export const mutation = <T extends Array<Selection>>(
  name: string,
  select: (t: typeof Mutation) => T
): Operation<SelectionSet<T>> =>
  new Operation(name, "mutation", new SelectionSet(select(Mutation)));
