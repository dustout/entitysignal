using Microsoft.EntityFrameworkCore.Migrations;

namespace EntitySignal.Migrations
{
    public partial class renamedModelsToBeSingular : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Message",
                table: "Messages",
                newName: "Text");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Text",
                table: "Messages",
                newName: "Message");
        }
    }
}
