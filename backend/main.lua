local sqlite3 = require('lsqlite3')
db = db or sqlite3.open_memory()
dbAdmin = require('DbAdmin').new(db)
dbAdmin:exec("PRAGMA foreign_keys = ON;")

AUTHORS = [[
    CREATE TABLE IF NOT EXISTS Authors (
        PID TEXT PRIMARY KEY,
        NAME TEXT
    );
]]

POSTS = [[
    CREATE TABLE IF NOT EXISTS Posts (
        ID TEXT PRIMARY KEY,
        PID TEXT,
        BODY TEXT,
        NAME TEXT,
        FOREIGN KEY (PID) REFERENCES Authors(PID)
    );
]]

LIKES = [[
    CREATE TABLE IF NOT EXISTS Likes (
        ID TEXT PRIMARY KEY,
        POST_ID TEXT,
        USER_ID TEXT,
        FOREIGN KEY (POST_ID) REFERENCES Posts(ID),
        FOREIGN KEY (USER_ID) REFERENCES Authors(PID)
    );
]]

function InitDb()
    db:exec(AUTHORS)
    db:exec(POSTS)
    db:exec(LIKES)
    return dbAdmin:tables()
end

InitDb();

Handlers.add("social.Register", 
    function (msg)
        return msg.Action == "Register"
    end,
    function (msg)
        dbAdmin:exec(string.format([[
            INSERT INTO AUTHORS (PID, NAME) VALUES ('%s', '%s')
        ]], msg.From, msg.Name or 'anon'))
        Send({Target = msg.From, Action = 'Registered.', Data = msg.From})
        print('Successfully Registered:'.. msg.From .. '--' .. (msg.Name or 'anon'))
    end
)

Handlers.add("social.Post", 
    function (msg)
        return msg.Action == "Create-Post"
    end,
    function (msg)
        local author = dbAdmin:exec(string.format([[
            SELECT * FROM AUTHORS WHERE PID = '%s';
        ]], msg.From))[1]
        if author then
            dbAdmin:exec(string.format([[
                INSERT INTO POSTS (ID, PID, BODY, NAME) VALUES ('%s', '%s', '%s', '%s')
            ]], msg.Id, msg.From, msg.Body, author.NAME or 'anon'))
            print(author.NAME)
            Send({Target = msg.From, Action = 'Post-Created.', Data = 'Successfully Created Post'})
            print('Successfully Created Post:'.. msg.From .. '--' .. msg.Body)
        else
            Send({Target = msg.From, Data = 'Author not found'})
            print('Author not found:'.. msg.From)
        end
    end
)

Handlers.add("social.Posts", function (msg)
    return msg.Action == "List"
  end,
  function (msg)
    local posts = dbAdmin:exec([[
      select p.ID, p.BODY, a.Name as "Authors" from Posts p LEFT OUTER JOIN Authors a ON p.PID = a.PID;
    ]])
    print("Listing " .. #posts .. " posts")
    Send({Target = msg.From, Action = "social.Posts", Data = require('json').encode(posts)})
  end
)

Handlers.add("socials.Get",
    function (msg) 
        return msg.Action == "Get"
    end,
    function (msg) 
        local post = dbAdmin:exec(string.format([[
            SELECT p.ID, p.BODY, a.Name as "Authors", p.Body FROM Posts p LEFT OUTER JOIN Authors a ON p.PID = a.PID 
            WHERE p.ID = "%s";
        ]], msg['Post-Id']))
        Send({Target = msg.From, Action = "Get-Response", Data = require('json').encode(post)})
        print(post)
    end
)

Handlers.add("social.PostsByAuthor", 
    function (msg)
        return msg.Action == "PostsByAuthor"
    end,
    function (msg)
        local posts = dbAdmin:exec(string.format([[
            SELECT p.ID, p.BODY, a.Name as "Authors" FROM Posts p LEFT OUTER JOIN Authors a ON p.PID = a.PID 
            WHERE p.PID = "%s";
        ]], msg['Author-Id']))
        print("Listing " .. #posts .. " posts")
        Send({Target = msg.From, Action = "Posts-By-Author", Data = require('json').encode(posts)})
    end
)

Handlers.add("social.DeletePost", 
    function (msg)
        return msg.Action == "Delete-Post"
    end,
    function (msg)
        dbAdmin:exec(string.format([[
            DELETE FROM Posts WHERE ID = "%s";
        ]], msg['Post-Id']))
        Send({Target = msg.From, Action = "Post-Deleted", Data = "Post Deleted"})
        print("Post Deleted:".. msg['Post-Id'])
    end
)

Handlers.add("socials.Profile", 
    function (msg)
        return msg.Action == "Profile-user"
    end,
    function (msg)
        local authorId = msg['Author-Id']
        if not authorId then
            print("Error: Author-Id not provided")
            Send({Target = msg.From, Action = "Error", Data = "Author-Id not provided"})
            return
        end

        local query = string.format([[
            SELECT * FROM Authors WHERE PID = '%s';
        ]], authorId)

        local profile = dbAdmin:exec(query)
        print("Query Result: " .. require('json').encode(profile))

        if #profile > 0 then
            Send({Target = msg.From, Action = "Profile", Data = require('json').encode(profile)})
            print("Listing " .. #profile .. " profile(s)")
        else
            Send({Target = msg.From, Action = "Error", Data = "Profile not found"})
            print("Profile not found: " .. authorId)
        end
    end
)


-- liking and unliking the posts handlers 


Handlers.add("social.like",
    function (msg)  
        return msg.Action == "Like-Post"
    end,
    function(msg)
        local posts = dbAdmin:exec(string.format([[
            SELECT * FROM Posts WHERE ID = '%s';
        ]], msg['Post-Id']))
        
        print(posts)
        if #posts > 0 then
            local liked = dbAdmin:exec(string.format([[
                SELECT * FROM Likes WHERE POST_ID = '%s' AND USER_ID = '%s';
            ]], msg['Post-Id'], msg.From))
            print("liked posts result: ", liked)
            if liked == 0 then
                dbAdmin:exec(string.format([[
                    INSERT INTO Likes (ID, POST_ID, USER_ID) VALUES ('%s', '%s', '%s');
                ]], msg.Id, msg['Post-Id'], msg.From))
                Send({Target = msg.From, Action = "Liked", Data = "Post Liked"})
                print("Successfully Liked posts: ".. msg['Post-Id'])
            else
                Send({Target = msg.From, Data = "Post already liked"})
                print("Post already liked:".. msg['Post-Id'])
            end
        else
            Send({Target = msg.From, Data = "Post not found"})
            print("Post not found:".. msg['Post-Id'])
        end     
    end    
)

Handlers.add("social.Unlike", 
    function (msg)
        return msg.Action == "Unlike-Post"
    end,
    function (msg)
        -- Check if the post exists
        local post = dbAdmin:exec(string.format([[
            SELECT * FROM POSTS WHERE ID = '%s';
        ]], msg['Post-Id']))[1]
        
        if post then
            -- Check if the user has liked the post
            local like = dbAdmin:exec(string.format([[
                SELECT * FROM Likes WHERE POST_ID = '%s' AND USER_ID = '%s';
            ]], msg['Post-Id'], msg.From))[1]
            
            if like then
                -- Delete the like
                dbAdmin:exec(string.format([[
                    DELETE FROM Likes WHERE POST_ID = '%s' AND USER_ID = '%s';
                ]], msg['Post-Id'], msg.From))
                Send({Target = msg.From, Action = 'Unliked.', Data = 'Successfully Unliked Post'})
                print('Successfully Unliked Post:'.. msg.From .. '--' .. msg['Post-Id'])
            else
                Send({Target = msg.From, Data = 'You have not liked this post'})
                print('Not liked post:'.. msg.From .. '--' .. msg['Post-Id'])
            end
        else
            Send({Target = msg.From, Data = 'Post not found'})
            print('Post not found:'.. msg['Post-Id'])
        end
    end
)