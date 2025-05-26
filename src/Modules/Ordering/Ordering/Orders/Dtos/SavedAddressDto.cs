using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ordering.Orders.Dtos
{
    public record SavedAddressDto(
        Guid Id,
        string CustomerId,
        ShippingAddressDto Address,
        bool IsDefault
    );

}
