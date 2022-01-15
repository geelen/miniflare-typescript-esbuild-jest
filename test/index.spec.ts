import worker from "@/index";
import { ctx } from './utils'

test("should redirect to example page on no route match", async () => {
  const env = getMiniflareBindings();
  const res = await worker.fetch(new Request("http://localhost"), env, ctx);
  expect(res.status).toBe(404);
});

/*
*
* class User {
* @surrogate-id
	username: string
	email: string
	avatar: string
	posts: Post[]
}

class Post {
  title: string
  body: string
  author: User
  createdAt: Date
}

* */

test("should pass-through to durable object", async () => {
  const env = getMiniflareBindings();
  const { COUNTER } = env;
  const id = COUNTER.idFromName("name");
  const storage = await getMiniflareDurableObjectStorage(id);
  await storage.put("count", 20);

  const req = new Request("http://localhost/graphql", {
    method: 'POST',
    body: `
      query {
        userByUsername(username: 'glen') {
          id
          email
          avatar
          posts {
            title
          }
        }
      }
    `
  });
  const res = await worker.fetch(req, env, ctx);
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ok: true});

  const newValue = await storage.get("count");
  expect(newValue).toBe(11);
});
