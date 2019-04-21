using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using EntitySignal.Hubs;
using EntitySignal.Models;
using EntitySignal.Server.EFDbContext.Data;
using EntitySignal.Services;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace EntitySignal.Data
{
  public class ApplicationDbContext : EntitySignalIdentityDbContext
  {

    public DbSet<Message> Messages { get; set; }
    public DbSet<Joke> Jokes { get; set; }

    public ApplicationDbContext(
      DbContextOptions<ApplicationDbContext> options,
      EntitySignalDataProcess entitySignalDataProcess
      )
        : base(options, entitySignalDataProcess)
    {

    }

  }
}
