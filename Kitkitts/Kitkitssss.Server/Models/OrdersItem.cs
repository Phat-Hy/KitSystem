﻿// <auto-generated> This file has been auto generated by EF Core Power Tools. </auto-generated>
#nullable disable
using System;
using System.Collections.Generic;

namespace Kitkitssss.Server.Models;

public partial class OrdersItem
{
    public int OrdersItemsId { get; set; }

    public int? OrdersId { get; set; }

    public int? KitId { get; set; }

    public int? Quantity { get; set; }

    public virtual Kit Kit { get; set; }

    public virtual Order Orders { get; set; }
}