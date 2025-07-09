
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  type: string;
}

const mockClients: Client[] = [
  { id: '1', name: 'Acme Corporation', email: 'contact@acme.com', type: 'client' },
  { id: '2', name: 'Alpha Industries', email: 'info@alphaindustries.com', type: 'client' },
  { id: '3', name: 'Beta Solutions Ltd', email: 'info@betasolutions.com', type: 'client' },
  { id: '4', name: 'Creative Designs Inc', email: 'hello@creativedesigns.com', type: 'vendor' },
  { id: '5', name: 'Delta Technologies', email: 'support@deltatech.com', type: 'client' },
  { id: '6', name: 'Echo Enterprises', email: 'contact@echoenterprises.com', type: 'vendor' },
  { id: '7', name: 'Future Innovations', email: 'info@futureinnovations.com', type: 'client' },
  { id: '8', name: 'Global Systems', email: 'hello@globalsystems.com', type: 'vendor' },
  { id: '9', name: 'Horizon Media', email: 'contact@horizonmedia.com', type: 'client' },
  { id: '10', name: 'Infinite Solutions', email: 'info@infinitesolutions.com', type: 'vendor' },
  { id: '11', name: 'Jupiter Holdings', email: 'contact@jupiterholdings.com', type: 'client' },
  { id: '12', name: 'Kinetic Energy', email: 'info@kineticenergy.com', type: 'vendor' },
  { id: '13', name: 'Lunar Technologies', email: 'hello@lunartech.com', type: 'client' },
  { id: '14', name: 'Matrix Innovations', email: 'contact@matrixinnovations.com', type: 'vendor' },
  { id: '15', name: 'Nova Industries', email: 'info@novaindustries.com', type: 'client' },
  { id: '16', name: 'Omega Enterprises', email: 'contact@omegaenterprises.com', type: 'vendor' },
  { id: '17', name: 'Phoenix Solutions', email: 'info@phoenixsolutions.com', type: 'client' },
  { id: '18', name: 'Quantum Systems', email: 'hello@quantumsystems.com', type: 'vendor' },
  { id: '19', name: 'Rapid Developments', email: 'contact@rapiddev.com', type: 'client' },
  { id: '20', name: 'Zenith Corporation', email: 'contact@zenithcorp.com', type: 'client' }
];

interface ClientSelectorProps {
  value?: string;
  onSelect: (client: Client) => void;
  placeholder?: string;
  filterType?: 'client' | 'vendor' | 'all';
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onSelect,
  placeholder = "Select client",
  filterType = 'all'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedClient = mockClients.find(client => client.id === value);
  
  // Filter clients by type and search term
  const filteredClients = mockClients
    .filter(client => filterType === 'all' || client.type === filterType)
    .filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleClientSelect = (client: Client) => {
    onSelect(client);
    setIsOpen(false);
    setSearchTerm("");
  };

  const displayedClients = filteredClients.slice(0, 6);
  const hasMoreClients = filteredClients.length > 6;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-between",
          !selectedClient && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedClient ? selectedClient.name : placeholder}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <ScrollArea className="h-72">
            <div className="p-1">
              {displayedClients.length > 0 ? (
                <>
                  {displayedClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex flex-col p-3 cursor-pointer hover:bg-gray-100 rounded border-b last:border-b-0"
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{client.name}</span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          client.type === 'client' 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-green-100 text-green-800"
                        )}>
                          {client.type}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{client.email}</span>
                    </div>
                  ))}
                  {hasMoreClients && (
                    <div className="p-2 text-center text-sm text-muted-foreground border-t bg-gray-50">
                      Showing {displayedClients.length} of {filteredClients.length} results
                      {searchTerm && " - Type to filter further"}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? "No clients found matching your search" : "No clients available"}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
