using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using EntitySignal.Services;
using System.Threading.Tasks;
using System.Threading;

namespace EntitySignal.Server.EFDbContext.Data
{
  public abstract class EntitySignalDbContext : DbContext
  {
    public EntitySignalDataProcess _entitySignalDataProcess { get; }

    public EntitySignalDbContext(
      DbContextOptions options,
      EntitySignalDataProcess entitySignalDataProcess
      )
        : base(options)
    {
      _entitySignalDataProcess = entitySignalDataProcess;
    }

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

  }
}
