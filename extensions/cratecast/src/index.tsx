import { useState } from "react";
import { useFetch } from "@raycast/utils";
import { Action, ActionPanel, Detail, Icon, List } from "@raycast/api";

interface CrateSearch {
  id: string;
  name: string;
  default_version: string;
  description?: string;
  homepage?: string;
}

interface MetaSearch {
  total: number;
  next_page?: string;
  prev_page?: string;
}

interface CratesSearchResponse {
  crates: CrateSearch[];
  meta: MetaSearch;
}

const CRATES_IO_BASE = "https://crates.io/api/v1";

export default function SearchList() {
  const [searchText, setSearchText] = useState("");

  const { isLoading, data } = useFetch<CratesSearchResponse>(`${CRATES_IO_BASE}/crates?q=${searchText}`, {
    headers: {
      // crates.io require User-Agent in API request
      "User-Agent": "crates.io Raycast Extension",
    },
  });

  const hasSearchText = searchText.trim().length > 0;
  const hasResult = (data?.crates.length ?? 0) > 0;

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      throttle
      searchBarPlaceholder="Search on crates.io"
    >
      {!hasSearchText && <List.EmptyView title="Type something to get started" />}

      {hasResult &&
        data?.crates.map((crate) => {
          return (
            <List.Item
              icon={{
                source: {
                  light: "https://cdn.simpleicons.org/docsdotrs/000",
                  dark: "https://cdn.simpleicons.org/docsdotrs/fff",
                },
              }}
              key={crate.id}
              title={crate.name}
              subtitle={crate.description ?? ""}
              accessories={[{ text: crate.default_version, icon: Icon.Tag }]}
              actions={
                <ActionPanel>
                  <Action.Push title="See Detail" target={<DetailPage crateId={crate.id} />} />
                </ActionPanel>
              }
            />
          );
        })}
    </List>
  );
}

interface CrateDetail {
  id: string;
  name: string;
  version: string[];
  keywords: string[];
  categories: string[];
  default_version: string;
}

interface CrateDetailResponse {
  crate: CrateDetail;
}

function DetailPage(props: { crateId: string }) {
  const { data: crateData } = useFetch<CrateDetailResponse>(`${CRATES_IO_BASE}/crates/${props.crateId}`, {
    headers: {
      "User-Agent": "crates.io Raycast Extension",
    },
  });

  const { isLoading: isReadmeLoading, data: ReadmeData } = useFetch<string>(
    `${CRATES_IO_BASE}/crates/${props.crateId}/${crateData?.crate.default_version}/readme`,
    {
      headers: {
        "User-Agent": "crates.io Raycast Extension",
      },
    },
  );

  return (
    <Detail
      isLoading={isReadmeLoading}
      markdown={ReadmeData}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Author"></Detail.Metadata.Label>
        <Detail.Metadata.TagList title="Tags">
          {
            crateData?.crate.keywords.map((keyword) => (
              <Detail.Metadata.TagList.Item key={keyword} text={keyword}/>
            ))
          }
        </Detail.Metadata.TagList>
        </Detail.Metadata>
      }
    ></Detail>
  );
}
