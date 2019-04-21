### Configure Back End

#### Install Packages
*Nuget:* `Install-Package EntitySignal.Server`

*NPM:* `npm i entity-signal`


#### Configure Startup.cs
Add `AddEntitySignal()` as a service in the `ConfigureServices` function
```csharp
public void ConfigureServices(IServiceCollection services)
{
  //Normal stuff here
  services.AddSignalR();
  services.AddEntitySignal();
}
```

Map a EntitySignalHub with SignalR to */dataHub* endpoint.
```csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
  //normal stuff here
  app.UseSignalR(routes =>
  {
    routes.MapHub<EntitySignalHub>("/dataHub");
  });
}
```

#### Use Entity Signal Data Context
Replace `IdentityDbContext` with `EntitySignalIdentityDbContext` or `DbContext` with `EntitySignalDbContext`.

Add a `EntitySignalDataProcess` dependency injection and pass into the base class.
```csharp
public class ApplicationDbContext : EntitySignalIdentityDbContext
{
  public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options,
    EntitySignalDataProcess entitySignalDataProcess)
      : base(options, entitySignalDataProcess)
  {
  }
}
```

#### Create Subscribe Endpoint
The below function subscribes to all changes of type `Message`

```csharp
[HttpGet]
public ActionResult<IEnumerable<Message>> SubscribeToAllMessages()
{
  _entitySignalSubscribe.Subscribe<Message>();

  return _db.Messages.ToList();
}
```

The below function subscribes to all changes of type `Message` where the ID is odd
```csharp
[HttpGet]
public IEnumerable<Message> SubscribeToOddIdMessages()
{
  var userContainer = _entitySignalSubscribe.Subscribe<Message>(x=> x.Id % 2 == 1);

  return _db.Messages
    .Where(userContainer.Query)
    .ToList();
}
```
