﻿// <auto-generated> This file has been auto generated by EF Core Power Tools. </auto-generated>
#nullable disable
using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Kitkitssss.Server.Models;

public partial class KitkitsContext : DbContext
{
    public KitkitsContext(DbContextOptions<KitkitsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Kit> Kits { get; set; }

    public virtual DbSet<KitStatus> KitStatuses { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrdersItem> OrdersItems { get; set; }

    public virtual DbSet<OrdersStatus> OrdersStatuses { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UsersStatus> UsersStatuses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Category__19093A0B8C58EB8B");

            entity.ToTable("Category");

            entity.Property(e => e.CategoryName).HasMaxLength(255);
        });

        modelBuilder.Entity<Kit>(entity =>
        {
            entity.HasKey(e => e.KitId).HasName("PK__Kit__C96EE4A7B1DC2E6D");

            entity.ToTable("Kit");

            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.KitName).HasMaxLength(255);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Category).WithMany(p => p.Kits)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__Kit__CategoryId__5535A963");

            entity.HasOne(d => d.KitStatus).WithMany(p => p.Kits)
                .HasForeignKey(d => d.KitStatusId)
                .HasConstraintName("FK__Kit__KitStatusId__5629CD9C");
        });

        modelBuilder.Entity<KitStatus>(entity =>
        {
            entity.HasKey(e => e.KitStatusId).HasName("PK__KitStatu__C27BA9A5F4B372B6");

            entity.ToTable("KitStatus");

            entity.Property(e => e.KitStatusName).HasMaxLength(255);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrdersId).HasName("PK__Orders__630B9976154A5A3D");

            entity.Property(e => e.Apartment).HasMaxLength(255);
            entity.Property(e => e.City).HasMaxLength(255);
            entity.Property(e => e.CompanyName).HasMaxLength(255);
            entity.Property(e => e.OrdersDate).HasColumnType("datetime");
            entity.Property(e => e.OrdersImage).HasColumnType("image");
            entity.Property(e => e.Postcode).HasMaxLength(50);
            entity.Property(e => e.ReceiveName).HasMaxLength(255);
            entity.Property(e => e.ReceivePhoneNumbers).HasMaxLength(50);
            entity.Property(e => e.StreetAddress).HasMaxLength(255);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Status).WithMany(p => p.Orders)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK__Orders__StatusId__5BE2A6F2");

            entity.HasOne(d => d.Users).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UsersId)
                .HasConstraintName("FK__Orders__UsersId__5AEE82B9");
        });

        modelBuilder.Entity<OrdersItem>(entity =>
        {
            entity.HasKey(e => e.OrdersItemsId).HasName("PK__OrdersIt__BB4FA333CE9E12D9");

            entity.HasOne(d => d.Kit).WithMany(p => p.OrdersItems)
                .HasForeignKey(d => d.KitId)
                .HasConstraintName("FK__OrdersIte__KitId__5FB337D6");

            entity.HasOne(d => d.Orders).WithMany(p => p.OrdersItems)
                .HasForeignKey(d => d.OrdersId)
                .HasConstraintName("FK__OrdersIte__Order__5EBF139D");
        });

        modelBuilder.Entity<OrdersStatus>(entity =>
        {
            entity.HasKey(e => e.OrdersStatusId).HasName("PK__OrdersSt__ADE12BA1191F18A4");

            entity.ToTable("OrdersStatus");

            entity.Property(e => e.OrdersStatusName).HasMaxLength(255);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE3A038ABCAE");

            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.RoleName).HasMaxLength(255);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C07F3E912");

            entity.Property(e => e.Apartment).HasMaxLength(255);
            entity.Property(e => e.City).HasMaxLength(255);
            entity.Property(e => e.CompanyName).HasMaxLength(255);
            entity.Property(e => e.Country).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FirstName).HasMaxLength(255);
            entity.Property(e => e.LastName).HasMaxLength(255);
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.PostCode).HasMaxLength(50);
            entity.Property(e => e.RoleId).HasColumnName("RoleID");
            entity.Property(e => e.StatusId).HasColumnName("StatusID");
            entity.Property(e => e.StreetAddress).HasMaxLength(255);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK__Users__RoleID__4D94879B");

            entity.HasOne(d => d.Status).WithMany(p => p.Users)
                .HasForeignKey(d => d.StatusId)
                .HasConstraintName("FK__Users__StatusID__4E88ABD4");
        });

        modelBuilder.Entity<UsersStatus>(entity =>
        {
            entity.HasKey(e => e.StatusId).HasName("PK__UsersSta__C8EE20435ABC00F7");

            entity.ToTable("UsersStatus");

            entity.Property(e => e.StatusId).HasColumnName("StatusID");
            entity.Property(e => e.StatusName).HasMaxLength(255);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}