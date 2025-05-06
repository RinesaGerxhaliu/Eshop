using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Catalog.Data.Migrations
{
    /// <inheritdoc />
    public partial class Change : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductImages",
                schema: "catalog",
                table: "ProductImages");

            migrationBuilder.DropIndex(
                name: "IX_ProductImages_ProductId",
                schema: "catalog",
                table: "ProductImages");

            migrationBuilder.DropColumn(
                name: "Id",
                schema: "catalog",
                table: "ProductImages");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                schema: "catalog",
                table: "ProductImages");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "catalog",
                table: "ProductImages");

            migrationBuilder.DropColumn(
                name: "LastModified",
                schema: "catalog",
                table: "ProductImages");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                schema: "catalog",
                table: "ProductImages");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductImages",
                schema: "catalog",
                table: "ProductImages",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductImages",
                schema: "catalog",
                table: "ProductImages");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                schema: "catalog",
                table: "ProductImages",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                schema: "catalog",
                table: "ProductImages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "catalog",
                table: "ProductImages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModified",
                schema: "catalog",
                table: "ProductImages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastModifiedBy",
                schema: "catalog",
                table: "ProductImages",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductImages",
                schema: "catalog",
                table: "ProductImages",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ProductImages_ProductId",
                schema: "catalog",
                table: "ProductImages",
                column: "ProductId");
        }
    }
}
