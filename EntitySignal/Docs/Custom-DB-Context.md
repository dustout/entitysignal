### [View Example](https://github.com/dustout/entitysignal/blob/master/EntitySignal.Server/Data/EntitySignalDbContext.cs)

#### Overview
This guide will show how to add Entity Signal without overriding your DB Context

#### Step 1: Dependency Inject Entity Signal
```csharp
public EntitySignalDataProcess _entitySignalDataProcess { get; }

  public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options,
    EntitySignalDataProcess entitySignalDataProcess)
      : base(options)
  {
    _entitySignalDataProcess = entitySignalDataProcess;
  }
}
```

#### Step 2: Override `SaveChanges` and `SaveChangesAsync`,  
```csharp
public override int SaveChanges()
{
  var changedData = _entitySignalDataProcess.PreSave(ChangeTracker);
  var result = base.SaveChanges();
  _entitySignalDataProcess.PostSave(changedData);
  return result;
}

public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default(CancellationToken))
{
  var changedData = _entitySignalDataProcess.PreSave(ChangeTracker);
  var result = await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
  await _entitySignalDataProcess.PostSaveAsync(changedData);
  return result;
}

public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken))
{
  return base.SaveChangesAsync(cancellationToken: cancellationToken);
}
```
