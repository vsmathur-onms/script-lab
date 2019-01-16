import React from 'react';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { DefaultButton, MessageBarButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

import Only from 'common/lib/components/Only';

import Content from '../Content';
import GalleryList from '../GalleryList';

const localStorageKeyHasDismissedWarning = 'has_dismissed_local_storage_warning';

interface IProps {
  solutions: ISolution[];
  openSolution: (solutionId: string) => void;
  activeSolution?: ISolution;
  gistMetadata: ISharedGistMetadata[];
  openGist: (gistMetadata: ISharedGistMetadata) => void;
  isSignedIn: boolean;
  signIn: () => void;
}

interface IState {
  filterQuery: string;
  localStorageWarningIsVisible: boolean;
}

class MySolutions extends React.Component<IProps> {
  state: IState = {
    filterQuery: '',
    localStorageWarningIsVisible: !localStorage.getItem(
      localStorageKeyHasDismissedWarning,
    ),
  };

  componentWillMount() {
    this.setFilterQuery('');
  }

  setFilterQuery = (filterQuery: string) => this.setState({ filterQuery });

  hideLocalStorageWarning = () => {
    this.setState({ localStorageWarningIsVisible: false }, () =>
      localStorage.setItem(localStorageKeyHasDismissedWarning, 'true'),
    );
  };

  render() {
    const {
      solutions,
      openSolution,
      activeSolution,
      gistMetadata,
      openGist,
      isSignedIn,
    } = this.props;

    return (
      <Content title="My Snippets" description="Choose a snippet that you have saved">
        <SearchBox
          data-testid="solution-search"
          placeholder="Search your snippets"
          onChange={this.setFilterQuery}
        />
        <GalleryList
          testId="my-solution-list"
          title="My snippets on this computer"
          messageBar={
            <Only when={this.state.localStorageWarningIsVisible}>
              <MessageBar
                messageBarType={MessageBarType.severeWarning}
                isMultiline={true}
                dismissButtonAriaLabel="Close"
                onDismiss={this.hideLocalStorageWarning}
              >
                Snippets you create get erased if you clear your browser cache. To save
                snippets permanently, export them as gists from the Share menu.
              </MessageBar>
            </Only>
          }
          items={solutions
            .filter(solution => {
              if (this.state.filterQuery === '') {
                return true;
              }

              const megaString = [solution.name, solution.description]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

              return megaString.includes(this.state.filterQuery.toLowerCase());
            })
            .map(sol => ({
              key: sol.id,
              title: sol.name,
              description: sol.description,
              onClick: () => openSolution(sol.id),
              isActive: activeSolution && activeSolution.id === sol.id,
            }))}
        />
        {/*
        We want to show the "My shared gists" either when:
        1) You're not signed in, so that we can tell you that you should. And so that you still see this UI
        2) You have 1 or more gists.
        For signed in case but with empty gists, omit this section.
        */}
        {(!isSignedIn || gistMetadata.length > 0) && (
          <GalleryList
            title="My shared gists on GitHub"
            items={gistMetadata
              .filter((meta: ISharedGistMetadata) => {
                if (this.state.filterQuery === '') {
                  return true;
                }

                const megaString = [meta.title, meta.description]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase();

                return megaString.includes(this.state.filterQuery.toLowerCase());
              })
              .map(gist => ({
                key: gist.id,
                title: gist.title,
                description: gist.description,
                onClick: () => openGist(gist),
              }))}
          />
        )}
        {!isSignedIn && (
          <div style={{ margin: '1rem', marginLeft: '2rem' }}>
            <Label>You must be logged in to see your gists</Label>
            <DefaultButton
              text="Sign In"
              label="You must be logged in to see your gists"
              onClick={this.props.signIn}
            />
          </div>
        )}
      </Content>
    );
  }
}

export default MySolutions;
