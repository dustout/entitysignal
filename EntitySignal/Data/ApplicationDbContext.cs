using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using EntitySignal.Hubs;
using EntitySignal.Models;
using EntitySignal.Services;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace EntitySignal.Data
{
  public class ApplicationDbContext : IdentityDbContext
  {
    public EntitySignalDataProcess _entitySignalDataProcess { get; }

    public DbSet<Messages> Messages { get; set; }
    public DbSet<Jokes> Jokes { get; set; }

    public ApplicationDbContext(
      DbContextOptions<ApplicationDbContext> options,
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
