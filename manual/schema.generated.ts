export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CreatePostInput = {
  authorId?: InputMaybe<Scalars['ID']>;
  body?: InputMaybe<Scalars['String']>;
  slug: Scalars['String'];
  title?: InputMaybe<Scalars['String']>;
};

export type CreateUserInput = {
  avatar?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  postsIds?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
  username: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost?: Maybe<Post>;
  createUser?: Maybe<User>;
  updatePostById?: Maybe<Post>;
  updatePostBySlug?: Maybe<Post>;
  updateUserById?: Maybe<User>;
  updateUserByUsername?: Maybe<User>;
};


export type MutationCreatePostArgs = {
  input: CreatePostInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationUpdatePostByIdArgs = {
  id: Scalars['ID'];
  input: UpdatePostInput;
};


export type MutationUpdatePostBySlugArgs = {
  input: UpdatePostInput;
  slug: Scalars['String'];
};


export type MutationUpdateUserByIdArgs = {
  id: Scalars['ID'];
  input: UpdateUserInput;
};


export type MutationUpdateUserByUsernameArgs = {
  input: UpdateUserInput;
  username: Scalars['String'];
};

export type Post = {
  __typename?: 'Post';
  author?: Maybe<User>;
  body?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  id: Scalars['ID'];
  slug: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  getPostById?: Maybe<Post>;
  getPostBySlug?: Maybe<Post>;
  getUserById?: Maybe<User>;
  getUserByUsername?: Maybe<User>;
};


export type QueryGetPostByIdArgs = {
  id: Scalars['ID'];
};


export type QueryGetPostBySlugArgs = {
  slug: Scalars['String'];
};


export type QueryGetUserByIdArgs = {
  id: Scalars['ID'];
};


export type QueryGetUserByUsernameArgs = {
  username: Scalars['String'];
};

export type UpdatePostInput = {
  authorId?: InputMaybe<Scalars['ID']>;
  body?: InputMaybe<Scalars['String']>;
  title?: InputMaybe<Scalars['String']>;
};

export type UpdateUserInput = {
  avatar?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  postsIds?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']>;
  createdAt: Scalars['String'];
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  posts?: Maybe<Array<Maybe<Post>>>;
  updatedAt: Scalars['String'];
  username: Scalars['String'];
};
