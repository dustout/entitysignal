using EntitySignal.Services;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace EntitySignal.Server.EFDbContext.Data
{
  public abstract class EntitySignalIdentityDbContext<TUser> : IdentityDbContext<TUser> where TUser : IdentityUser
  {
    public EntitySignalDataProcess _entitySignalDataProcess { get; }

    public EntitySignalIdentityDbContext(
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

  public abstract class EntitySignalIdentityDbContext<TUser, TRole, TKey> : IdentityDbContext<TUser, TRole, TKey>
    where TUser : IdentityUser<TKey>
    where TRole : IdentityRole<TKey>
    where TKey : IEquatable<TKey>
  {
    public EntitySignalDataProcess _entitySignalDataProcess { get; }

    public EntitySignalIdentityDbContext(
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

  public abstract class EntitySignalIdentityDbContext<TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken> : IdentityDbContext<TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken>
    where TUser : IdentityUser<TKey, TUserClaim, TUserRole, TUserLogin>
    where TRole : IdentityRole<TKey, TUserRole, TRoleClaim>
    where TKey : IEquatable<TKey>
    where TUserClaim : IdentityUserClaim<TKey>
    where TUserRole : IdentityUserRole<TKey>
    where TUserLogin : IdentityUserLogin<TKey>
    where TRoleClaim : IdentityRoleClaim<TKey>
    where TUserToken : IdentityUserToken<TKey>
  {
    public EntitySignalDataProcess _entitySignalDataProcess { get; }

    public EntitySignalIdentityDbContext(
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

  public abstract class EntitySignalIdentityDbContext : IdentityDbContext
  {
    public EntitySignalDataProcess _entitySignalDataProcess { get; }

    public EntitySignalIdentityDbContext(
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
