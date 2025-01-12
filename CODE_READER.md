# AI Code Analyze

I've been thinking a lot about automating my job as a software engineer. Many thoughts have crossed my mind. Simple tasks as handling communications and/or summarizing mails seems trivial (although I've yet to try a tool to analyze my mail using AI).

I've used AI (ChatGPT and friends) mostly to generate snippets of code, but most of my problems are much more complex than writing a few lines of code. Usually the problems I've been paid to solve are figuring out which handful of lines of code to change.

Debugging and analyzing existing functionality seems to be, in my case, the most time consuming parts of the job. I also think these are the least fun part of the job. I'd rather create stuff. Even when creating stuff in foreign applications (applications that are foreign to me, being dropped in as an outside contractor), I'll mostly spend my time figuring out how other features are created so my new features are somewhat similar to the existing code.

For an AI to write code that fits neatly in an existing, huge codebase, it needs to be able to analyze fragments of the codebase and produce something new based on the fragments. Ideally, it should be able to look for relevant, similar pieces of code and write something somewhat similar.

Basically, for an AI to be useful to me, I think the logical next step is to have an AI analyze existing projects so I can reason about the code with the AI.

For example:

> Hello my friendly AI, can you give me some examples how to add a date-time field to a form?

Copilot does this somewhat reasonably well. However, I need something much stronger than copolit. I also want to ask questions like:

> For the `users.registered_at` field, sometimes the timestamp is UTC and sometimes it is in the local time zone (Europe/Amsterdam). It should only save UTC timestamps. Please find all occurrences where this field is written, including whether it writes UTC or Europe/Amsterdam.

The AI must then recognize to look into the model, to see how the field is mapped in code. The AI must look for SQL queries, or large update calls where the field might be updated. It must be able to find all occurrences where the property is assigned and the record is saved.

Some fictional examples that might be present in code:

```ruby
connection.query "UPDATE users SET registered_at = ? WHERE id = ?", new_date, id

user.update_columns registered_at: new_date

user.registered_at = new_date
user.save

# <input type="hidden" name="user[registered_at]" value="<%= new_date %>">
user.update request.params[:user]
```

To find all these possibilities, the AI must be able to navigate the code with intent. It is not enough to just look for occurrences on registered_at. However, it can start by searching for `registered_at` and then follow the flow of code.

Another example question:

> There's a query loading all Comment records on a Post at once, which can result in a query loading over 60.000 records. Where did we forget to paginate our query?

In this case it needs to navigate all code looking for `post.comments` or `Comment.all` or something similar, without pushing all code to an API.

To allow AI to analyze code while staying within the token limit, I imagine to give the AI a set of tools which it can use to navigate code. Let's first do it the crude way: Shell access.

## OpenAI API with shell access
