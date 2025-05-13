using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordering.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveATable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SavedAddresses_ShippingAddress_ShippingAddressId",
                schema: "ordering",
                table: "SavedAddresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Shipments_ShippingAddress_ShippingAddressId",
                schema: "ordering",
                table: "Shipments");

            migrationBuilder.DropTable(
                name: "ShippingAddress",
                schema: "ordering");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_ShippingAddressId",
                schema: "ordering",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_SavedAddresses_ShippingAddressId",
                schema: "ordering",
                table: "SavedAddresses");

            migrationBuilder.DropColumn(
                name: "ShippingAddressId",
                schema: "ordering",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "ShippingAddressId",
                schema: "ordering",
                table: "SavedAddresses");

            migrationBuilder.AddColumn<string>(
                name: "City",
                schema: "ordering",
                table: "Shipments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                schema: "ordering",
                table: "Shipments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                schema: "ordering",
                table: "Shipments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                schema: "ordering",
                table: "Shipments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "State",
                schema: "ordering",
                table: "Shipments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Street",
                schema: "ordering",
                table: "Shipments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "City",
                schema: "ordering",
                table: "SavedAddresses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                schema: "ordering",
                table: "SavedAddresses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                schema: "ordering",
                table: "SavedAddresses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                schema: "ordering",
                table: "SavedAddresses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "State",
                schema: "ordering",
                table: "SavedAddresses",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Street",
                schema: "ordering",
                table: "SavedAddresses",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                schema: "ordering",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "Country",
                schema: "ordering",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                schema: "ordering",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                schema: "ordering",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "State",
                schema: "ordering",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "Street",
                schema: "ordering",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "City",
                schema: "ordering",
                table: "SavedAddresses");

            migrationBuilder.DropColumn(
                name: "Country",
                schema: "ordering",
                table: "SavedAddresses");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                schema: "ordering",
                table: "SavedAddresses");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                schema: "ordering",
                table: "SavedAddresses");

            migrationBuilder.DropColumn(
                name: "State",
                schema: "ordering",
                table: "SavedAddresses");

            migrationBuilder.DropColumn(
                name: "Street",
                schema: "ordering",
                table: "SavedAddresses");

            migrationBuilder.AddColumn<Guid>(
                name: "ShippingAddressId",
                schema: "ordering",
                table: "Shipments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "ShippingAddressId",
                schema: "ordering",
                table: "SavedAddresses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "ShippingAddress",
                schema: "ordering",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    Country = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    PostalCode = table.Column<string>(type: "text", nullable: false),
                    State = table.Column<string>(type: "text", nullable: false),
                    Street = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShippingAddress", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_ShippingAddressId",
                schema: "ordering",
                table: "Shipments",
                column: "ShippingAddressId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedAddresses_ShippingAddressId",
                schema: "ordering",
                table: "SavedAddresses",
                column: "ShippingAddressId");

            migrationBuilder.AddForeignKey(
                name: "FK_SavedAddresses_ShippingAddress_ShippingAddressId",
                schema: "ordering",
                table: "SavedAddresses",
                column: "ShippingAddressId",
                principalSchema: "ordering",
                principalTable: "ShippingAddress",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Shipments_ShippingAddress_ShippingAddressId",
                schema: "ordering",
                table: "Shipments",
                column: "ShippingAddressId",
                principalSchema: "ordering",
                principalTable: "ShippingAddress",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
