### Disclaimer
This quickstart is done assuming that you already have a working entity framework project

### Install Packages
*Nuget:* `Install-Package EntitySignal.Server`

*NPM:* `npm i entity-signal`


### Configure Startup.cs
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
  }
```

### Use Entity Signal Data Context
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

### Create Subscribe Endpoint
