using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EntitySignal.Models
{
  public class DocumentationViewModel
  {
    public String Markdown;
    public IEnumerable<string> Docs;
    public String Title;
    public String RequestedDoc;
  }
}
