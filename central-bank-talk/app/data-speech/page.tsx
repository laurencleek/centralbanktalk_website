"use client"

import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useData } from '@/contexts/DataContext'
import debounce from 'lodash/debounce'
import FlexSearch from 'flexsearch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { SectionHeader } from "@/components/ui/section-header"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Speech {
  url: string
  title: string
  date: string
  speaker: string
  position: string
  speech_identifier: string
  description: string
  location: string | null
  audience: string
  latitude: number | null
  longitude: number | null
  central_bank: string
  venue: string
}

interface SpeechContent {
  sentences: string[]
  classifications: string[]
  topics: string[]
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

export default function DataPage() {
  const { data: speeches, isLoading, error } = useData<Speech[]>("/data/metadata.json")
  const { data: centralBanks } = useData<Record<string, string>>("/data/central_banks/central_banks.json")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    date: true,
    title: true,
    speaker: true,
    central_bank: true,
    location: true,
    position: false,
    audience: false,
  })
  const [selectedSpeech, setSelectedSpeech] = React.useState<Speech | null>(null)
  const [speechContent, setSpeechContent] = React.useState<SpeechContent | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [yearFilter, setYearFilter] = React.useState<string>("all")
  const [bankFilter, setBankFilter] = React.useState<string>("all")
  const [searchIndex, setSearchIndex] = React.useState<FlexSearch.Index | null>(null)
  const [showClassifications, setShowClassifications] = React.useState(false)
  const [showWelcomeDialog, setShowWelcomeDialog] = React.useState(false)
  const [pageSize, setPageSize] = React.useState<number>(10)

  React.useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setShowWelcomeDialog(true)
    }
  }, [])

  const handleCloseWelcome = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem('hasSeenWelcome', 'true')
    }
    setShowWelcomeDialog(false)
  }

  React.useEffect(() => {
    if (speeches) {
      const index = new FlexSearch.Index({ 
        tokenize: "forward",
        preset: "score"
      })
      speeches.forEach((speech, idx) => {
        index.add(idx, `${speech.title} ${speech.description} ${speech.central_bank} ${speech.speaker} ${speech.position} ${speech.location || ''}`)
      })
      setSearchIndex(index)
    }
  }, [speeches])

  React.useEffect(() => {
    if (selectedSpeech) {
      fetch(`/data/speeches/${selectedSpeech.speech_identifier}.json`)
        .then(response => response.json())
        .then(data => setSpeechContent(data))
        .catch(error => console.error('Error fetching speech content:', error))
    }
  }, [selectedSpeech])

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    const parts = text.split(regex)
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
        )}
      </>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const columns: ColumnDef<Speech>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="whitespace-nowrap">{formatDate(row.getValue("date"))}</div>,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
          {highlightText(row.getValue("title"), searchTerm)}
        </div>
      ),
    },
    {
      accessorKey: "speaker",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Speaker
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">
          {highlightText(row.getValue("speaker"), searchTerm)}
        </div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => <div className="max-w-[150px] truncate">{highlightText(row.getValue("position"), searchTerm)}</div>,
    },
    {
      accessorKey: "central_bank",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Central Bank
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {highlightText(centralBanks?.[row.getValue("central_bank")] || row.getValue("central_bank"), searchTerm)}
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">
          {highlightText(row.getValue("location") || "N/A", searchTerm)}
        </div>
      ),
    },
    {
      accessorKey: "audience",
      header: "Audience",
      cell: ({ row }) => <div className="max-w-[150px] truncate">{highlightText(row.getValue("audience"), searchTerm)}</div>,
    },
  ]

  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value)
    }, 300),
    []
  )

  const filteredSpeeches = React.useMemo(() => {
    if (!speeches) return []
    
    let filtered = [...speeches] // Create a copy to avoid mutation

    // Apply search first
    if (searchTerm && searchIndex) {
      const results = searchIndex.search(searchTerm)
      filtered = results.map(idx => speeches[idx])
    }

    // Then apply filters
    if (yearFilter !== "all") {
      filtered = filtered.filter(speech => speech.date.startsWith(yearFilter))
    }

    if (bankFilter !== "all") {
      filtered = filtered.filter(speech => 
        centralBanks?.[speech.central_bank] === bankFilter || speech.central_bank === bankFilter
      )
    }

    return filtered
  }, [speeches, searchTerm, yearFilter, bankFilter, searchIndex, centralBanks])

  const years = React.useMemo(() => {
    if (!speeches) return []
    const uniqueYears = new Set(speeches.map(speech => speech.date.substring(0, 4)))
    return Array.from(uniqueYears).sort().reverse()
  }, [speeches])

  const banks = React.useMemo(() => {
    if (!speeches || !centralBanks) return []
    const uniqueBanks = new Set(speeches.map(speech => centralBanks[speech.central_bank] || speech.central_bank))
    return Array.from(uniqueBanks).sort()
  }, [speeches, centralBanks])

  const table = useReactTable({
    data: filteredSpeeches,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "financial dominance": return "bg-red-100 dark:bg-red-900"
      case "fiscal dominance": return "bg-blue-100 dark:bg-blue-900"
      case "monetary dominance": return "bg-green-100 dark:bg-green-900"
      case "monetary-fiscal coordination": return "bg-yellow-100 dark:bg-yellow-900"
      case "monetary-financial coordination": return "bg-purple-100 dark:bg-purple-900"
      default: return "bg-gray-100 dark:bg-gray-800"
    }
  }

  if (isLoading) {
    return <DataTableSkeleton />
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Error loading data: {error.message}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Dialog open={showWelcomeDialog} onOpenChange={() => handleCloseWelcome(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Welcome to the Speeches Database</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            When you click on the speech, the full speech and all meta-data appears including the option to see the LLM classifications on a sentence level.
          </p>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="dontShow" onCheckedChange={(checked) => handleCloseWelcome(checked)} />
            <Label htmlFor="dontShow">Don't show this message again</Label>
          </div>
        </DialogContent>
      </Dialog>

      <PageHeader 
        tag="EXPLORE SPEECHES"
        title="Search through our"
        titleAccent="speeches database"
        description="Explore central bank communications by date, bank and keywords."
      />
      <div className="container mx-auto px-4 pb-8 sm:pb-12">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <Input
                placeholder="Search speeches..."
                onChange={(event) => debouncedSearch(event.target.value)}
                className="w-full sm:max-w-sm"
              />
              <div className="flex gap-2">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={bankFilter} onValueChange={setBankFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All banks</SelectItem>
                    {banks.map(bank => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedSpeech(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="p-2">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} of {speeches?.length} speeches
              </p>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value))
                table.setPageSize(Number(value))
              }}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} rows
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={!!selectedSpeech} onOpenChange={() => {
          setSelectedSpeech(null)
          setSpeechContent(null)
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{selectedSpeech?.title}</DialogTitle>
              </DialogHeader>

              <div className="grid gap-0 text-sm">
                <div className="p-3 border-b border-blue-300">
                  <p><span className="font-medium">Date:</span> {selectedSpeech?.date && formatDate(selectedSpeech.date)}</p>
                </div>
                <div className="p-3 border-b border-blue-300">
                  <p><span className="font-medium">Speaker:</span> {selectedSpeech?.speaker}</p>
                </div>
                <div className="p-3 border-b border-blue-300">
                  <p><span className="font-medium">Position:</span> {selectedSpeech?.position}</p>
                </div>
                <div className="p-3 border-b border-blue-300">
                  <p><span className="font-medium">Central Bank:</span> {centralBanks?.[selectedSpeech?.central_bank || ""] || selectedSpeech?.central_bank}</p>
                </div>
                <div className="p-3 border-b border-blue-300">
                  <p><span className="font-medium">Audience:</span> {selectedSpeech?.audience}</p>
                </div>
                {selectedSpeech?.location && (
                  <div className="p-3 border-b border-blue-300">
                    <p><span className="font-medium">Location:</span> {selectedSpeech.location}</p>
                  </div>
                )}
                <div className="p-3">
                  <p><span className="font-medium">Description:</span> {selectedSpeech?.description}</p>
                </div>
              </div>

              {speechContent?.topics && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {speechContent.topics.map((topic, index) => (
                      <span key={index} className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="sticky top-0 bg-background z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Speech Content</h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showClassifications}
                      onCheckedChange={setShowClassifications}
                      id="show-classifications"
                    />
                    <Label htmlFor="show-classifications">Show Classifications</Label>
                  </div>
                </div>
                {showClassifications && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4">
                    {["none", "financial dominance", "fiscal dominance", "monetary dominance", "monetary-fiscal coordination", "monetary-financial coordination"].map((classification) => (
                      <div key={classification} className={`px-2 py-1 ${getClassificationColor(classification)} rounded text-sm text-center`}>
                        {classification}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                {speechContent ? (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {speechContent.sentences.map((sentence, index) => (
                      <span
                        key={index}
                        className={showClassifications ? getClassificationColor(speechContent.classifications[index]) : ""}
                      >
                        {sentence}{' '}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Loading speech content...</p>
                )}
              </div>

              <div className="pt-4">
                <Button asChild>
                  <a href={`https://www.bis.org/review/${selectedSpeech?.url}`}  target="_blank" rel="noopener noreferrer">
                    View PDF on BIS Website
                  </a>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function DataTableSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center space-x-2 mb-4">
        <div className="h-9 w-[384px] bg-muted rounded animate-pulse" />
        <div className="h-9 w-[180px] bg-muted rounded animate-pulse" />
        <div className="h-9 w-[180px] bg-muted rounded animate-pulse" />
        <div className="ml-auto h-9 w-[100px] bg-muted rounded animate-pulse" />
      </div>
      <div className="rounded-md border">
        <div className="h-10 border-b bg-muted/50" />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 border-b bg-muted/20 animate-pulse" style={{animationDelay: `${i * 100}ms`}} />
        ))}
      </div>
    </div>
  )
}